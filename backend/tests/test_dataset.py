import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from data import loader
from data.sync import refresh_dataset, parse_csv

CSV = 'id,en_name,ar_name,age,dob,sex,update\n1,Amal,أمل,0,2024-01-01,f,6\n2,Ali,علي,24,,m,6\n'


class DatasetTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.cache = Path(self.tmp.name) / 'snapshot.json'
        self.cache_patch = patch.object(loader, 'CACHE_PATH', self.cache)
        self.cache_patch.start()
        loader.reset_cache()

    def tearDown(self):
        self.cache_patch.stop()
        loader.reset_cache()
        self.tmp.cleanup()

    def refresh(self, data=CSV):
        with patch('data.sync.download_csv', return_value=(data.encode('utf-8'), 'Wed, 07 May 2026 00:00:00 GMT')):
            return refresh_dataset()

    def test_publish_and_reload_in_running_process(self):
        self.refresh()
        self.assertEqual(len(loader.get_records()), 2)
        self.assertEqual(loader.get_records()[0]['ar_name'], 'أمل')
        self.refresh(CSV.replace(',24,', ',25,'))
        self.assertEqual(loader.get_records()[1]['age'], 25)
        self.assertEqual(loader.get_dataset_metadata()['status'], 'fresh')
        self.assertEqual(json.loads(self.cache.read_text())['metadata']['record_count'], 2)

    def test_unchanged_content_retains_refresh_time(self):
        self.refresh()
        previous = loader.get_dataset_metadata()['refreshed_at']
        self.refresh()
        self.assertEqual(loader.get_dataset_metadata()['refreshed_at'], previous)

    def test_invalid_or_failed_download_preserves_last_good_bytes(self):
        self.refresh()
        previous = self.cache.read_bytes()
        for invalid in ['id,name\n1,Amal', CSV.replace(',24,', ',-1,'), CSV.replace(',24,', ',NaN,'), CSV.replace('2,Ali', '1,Ali'), CSV.replace('2024-01-01', 'invalid'), CSV.splitlines()[0] + '\n']:
            with self.subTest(invalid=invalid), patch('data.sync.download_csv', return_value=(invalid.encode(), None)):
                with self.assertRaises(ValueError):
                    refresh_dataset()
                self.assertEqual(self.cache.read_bytes(), previous)
                self.assertEqual(len(loader.get_records()), 2)
        with patch('data.sync.download_csv', side_effect=OSError('offline')):
            with self.assertRaises(OSError):
                refresh_dataset()
        self.assertEqual(self.cache.read_bytes(), previous)
        self.assertEqual(loader.get_dataset_metadata()['status'], 'stale')

    def test_missing_ids_are_stable_and_unknown_age_stays_unknown(self):
        rows = parse_csv(CSV.replace('1,Amal', ',Amal').replace(',24,', ',,'))
        self.assertTrue(rows[0]['id'].startswith('derived-'))
        self.assertEqual(rows[0]['id'], parse_csv(CSV.replace('1,Amal', ',Amal'))[0]['id'])
        self.assertIsNone(rows[1]['age'])

    def test_atomic_failure_preserves_snapshot(self):
        self.refresh()
        previous = self.cache.read_bytes()
        with patch('data.sync.os.replace', side_effect=OSError('disk failure')):
            with self.assertRaises(OSError):
                self.refresh(CSV.replace(',24,', ',25,'))
        self.assertEqual(self.cache.read_bytes(), previous)
        self.assertEqual(list(self.cache.parent.glob('*.tmp')), [])


if __name__ == '__main__':
    unittest.main()
