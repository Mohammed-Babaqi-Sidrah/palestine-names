import unittest
from unittest.mock import patch
from fastapi import FastAPI
from fastapi.testclient import TestClient
from routers.records import router

RECORDS = [
    {'id': 'a', 'ar_name': 'أَمَل النجار', 'en_name': 'Amal Najjar', 'age': 0, 'dob': None, 'sex': 'f', 'update': '6'},
    {'id': 'b', 'ar_name': 'علي النجار', 'en_name': 'Ali Najjar', 'age': 17, 'dob': '2000-01-01', 'sex': 'm', 'update': '6'},
    {'id': 'c', 'ar_name': 'ليلى', 'en_name': 'Layla', 'age': None, 'dob': None, 'sex': None, 'update': '6'},
    {'id': 'd', 'ar_name': 'سالم', 'en_name': 'Salem', 'age': 70, 'dob': None, 'sex': 'm', 'update': '6'},
]


class RecordsTests(unittest.TestCase):
    def setUp(self):
        app = FastAPI()
        app.include_router(router, prefix='/api')
        self.client = TestClient(app)
        self.records = patch('routers.records.get_records', return_value=RECORDS)
        self.records.start()

    def tearDown(self):
        self.records.stop()

    def test_statistics_are_derived_with_unknown_ages_excluded(self):
        stats = self.client.get('/api/statistics').json()
        self.assertEqual(stats['children_under_18'], 2)
        self.assertEqual(stats['infants_under_1'], 1)
        self.assertEqual(stats['unknown_age'], 1)
        self.assertEqual(sum(c['count'] for c in stats['cohorts']), 3)
        self.assertEqual(stats['max_age'], 70)

    def test_arabic_tokens_search_and_sort_work_together(self):
        res = self.client.get('/api/records', params={'q': 'النجار امل', 'sort': 'age'}).json()
        self.assertEqual([r['id'] for r in res['items']], ['a'])
        res = self.client.get('/api/records', params={'q': 'Najjar', 'sort': 'age', 'ascending': 'false'}).json()
        self.assertEqual([r['id'] for r in res['items']], ['b', 'a'])

    def test_pages_are_clamped_and_unknown_ages_sort_last(self):
        res = self.client.get('/api/records', params={'page': 99, 'page_size': 2, 'sort': 'age', 'ascending': 'false'}).json()
        self.assertEqual(res['page'], 2)
        self.assertEqual(res['items'][-1]['id'], 'c')
        self.assertEqual(self.client.get('/api/records', params={'age': '-1'}).status_code, 422)

    def test_no_results_still_has_a_valid_page(self):
        res = self.client.get('/api/records', params={'q': 'no match', 'page': 99}).json()
        self.assertEqual(res['items'], [])
        self.assertEqual(res['page'], 1)


if __name__ == '__main__':
    unittest.main()
