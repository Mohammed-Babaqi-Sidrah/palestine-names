"""One coherent records/provenance snapshot, with an offline CSV fallback."""
import json
import os
import threading
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[2]
load_dotenv(ROOT / 'backend/.env')
load_dotenv(ROOT / '.env')
DATA_PATH = ROOT / 'killed-in-gaza.csv'
CACHE_PATH = Path(os.environ.get('DATA_CACHE_PATH', ROOT / 'backend/.cache/names.json'))
SOURCE_URL = 'https://data.techforpalestine.org/api/v3/killed-in-gaza.csv'
SOURCE_DOCS = 'https://data.techforpalestine.org/docs/killed-in-gaza/'
_lock = threading.RLock()
_snapshot = None
_signature = None
_last_failure = None


def reset_cache():
    global _snapshot, _signature, _last_failure
    with _lock:
        _snapshot = _signature = _last_failure = None


def note_refresh_failure():
    global _last_failure
    from datetime import datetime, timezone
    with _lock:
        _last_failure = datetime.now(timezone.utc).isoformat()


def get_snapshot() -> dict:
    global _snapshot, _signature
    with _lock:
        signature = (CACHE_PATH.stat().st_mtime_ns, CACHE_PATH.stat().st_size) if CACHE_PATH.exists() else None
        if _snapshot is None or signature != _signature:
            from data.sync import parse_csv
            if signature is not None:
                try:
                    candidate = json.loads(CACHE_PATH.read_text(encoding='utf-8'))
                    records, metadata = candidate['records'], candidate['metadata']
                    if not isinstance(records, list) or not records or metadata['record_count'] != len(records) or metadata['origin'] != 'upstream':
                        raise ValueError('Invalid cached snapshot')
                    checked = datetime.fromisoformat(metadata['checked_at'])
                    if checked.tzinfo is None or not all(isinstance(r, dict) and {'id', 'ar_name', 'en_name', 'age', 'dob', 'sex', 'update'} <= r.keys() for r in records):
                        raise ValueError('Invalid cached snapshot')
                except (OSError, ValueError, KeyError, TypeError):
                    candidate = None
                    note_refresh_failure()
            else:
                candidate = None
            if candidate is None:
                if _snapshot is not None:
                    _signature = signature
                    return _snapshot
                records = parse_csv(DATA_PATH.read_text(encoding='utf-8-sig'))
                candidate = {'records': records, 'metadata': {
                    'record_count': len(records), 'source_url': SOURCE_URL,
                    'source_docs': SOURCE_DOCS, 'origin': 'bundled',
                    'source_revision': max((int(r['update']) for r in records if r['update']), default=None),
                    'checked_at': None, 'refreshed_at': None, 'source_last_modified': None,
                }}
            _snapshot, _signature = candidate, signature
        return _snapshot


def get_records() -> list[dict]:
    return get_snapshot()['records']


def get_dataset_metadata() -> dict:
    from datetime import datetime, timezone
    with _lock:
        metadata = dict(get_snapshot()['metadata'])
        checked = metadata.get('checked_at')
        stale = not checked or (datetime.now(timezone.utc) - datetime.fromisoformat(checked)).total_seconds() > 48 * 3600
        metadata['status'] = 'fallback' if metadata['origin'] == 'bundled' else 'stale' if stale or _last_failure else 'fresh'
        metadata['last_failed_attempt_at'] = _last_failure
        metadata['check_interval_hours'] = 24
        return metadata
