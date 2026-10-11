import csv
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

    def test_source_removals_and_corrections_replace_disk_and_api_records(self):
        from routers.records import list_records
        self.refresh()
        self.refresh(CSV.splitlines()[0] + '\n2,Ali,علي,25,,m,7\n')
        self.assertEqual([r['id'] for r in loader.get_records()], ['2'])
        self.assertEqual(loader.get_records()[0]['age'], 25)
        self.assertEqual(json.loads(self.cache.read_text(encoding='utf-8'))['metadata']['source_revision'], 7)
        self.assertEqual(list_records(page=1, page_size=12, q='', age=None, sort='source', ascending=True)['total'], 1)

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

    def test_truncated_row_is_rejected_instead_of_publishing_partial_data(self):
        with self.assertRaises(ValueError):
            parse_csv(CSV + '3,Test,سليم')

    def test_broken_quoting_and_duplicate_headers_preserve_good_snapshot(self):
        self.refresh()
        previous = self.cache.read_bytes()
        malformed = [
            CSV.splitlines()[0] + '\n1,Amal,أمل,0,2024-01-01,f,"10',
            CSV.replace('Amal', '"Amal"garbage'),
            CSV.replace('age,dob', 'age,age,dob').replace(',0,2024', ',0,45,2024').replace(',24,,', ',24,45,,'),
        ]
        for payload in malformed:
            with self.subTest(payload=payload), patch('data.sync.download_csv', return_value=(payload.encode(), None)):
                with self.assertRaises((ValueError, csv.Error)):
                    refresh_dataset()
                self.assertEqual(self.cache.read_bytes(), previous)

    def test_atomic_failure_preserves_snapshot(self):
        self.refresh()
        previous = self.cache.read_bytes()
        with patch('data.sync.os.replace', side_effect=OSError('disk failure')):
            with self.assertRaises(OSError):
                self.refresh(CSV.replace(',24,', ',25,'))
        self.assertEqual(self.cache.read_bytes(), previous)
        self.assertEqual(list(self.cache.parent.glob('*.tmp')), [])

    def test_corrupt_cache_keeps_running_snapshot_and_boots_from_bundled_data(self):
        self.refresh()
        self.assertEqual(loader.get_records()[0]['ar_name'], 'أمل')
        previous = self.cache.read_text(encoding='utf-8')
        corrupt = json.loads(previous)
        corrupt['metadata']['checked_at'] = 'not-a-date'
        self.cache.write_text(json.dumps(corrupt), encoding='utf-8')
        self.assertEqual(loader.get_records()[0]['ar_name'], 'أمل')
        self.assertEqual(loader.get_dataset_metadata()['status'], 'stale')
        loader.reset_cache()
        with patch.object(loader, 'DATA_PATH', Path(self.tmp.name) / 'bundled.csv'):
            loader.DATA_PATH.write_text(CSV, encoding='utf-8')
            self.assertEqual(loader.get_dataset_metadata()['status'], 'fallback')


if __name__ == '__main__':
    unittest.main()
