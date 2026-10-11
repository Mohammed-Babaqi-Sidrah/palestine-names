"""Download, validate and atomically publish the versioned names list.

Run manually from backend/: python -m data.sync
No network work occurs in a request handler. Source removals/corrections are
accepted: this is a replacement snapshot, not an append-only casualty counter.
"""
import csv
import hashlib
import io
import json
import logging
import math
import os
import tempfile
import urllib.request
from datetime import date, datetime, timezone

from data import loader

log = logging.getLogger(__name__)
MAX_BYTES = 25 * 1024 * 1024


def parse_csv(text: str) -> list[dict]:
    reader = csv.DictReader(io.StringIO(text.lstrip('\ufeff')), strict=True)
    columns = set(reader.fieldnames or [])
    if len(columns) != len(reader.fieldnames or []) or not {'id', 'age', 'dob', 'sex', 'update'}.issubset(columns) or not ({'ar_name', 'name'} & columns):
        raise ValueError('Unexpected names-list schema')
    records, ids = [], set()
    for row in reader:
        if None in row or any(value is None for value in row.values()):
            raise ValueError('Unexpected or incomplete CSV fields')
        def field(key):
            return (row.get(key) or '').strip()
        ar_name, en_name = field('ar_name') or field('name'), field('en_name')
        if not ar_name and not en_name:
            raise ValueError('Record has no name')
        raw_age = field('age')
        age = None
        if raw_age:
            try:
                number = float(raw_age)
            except ValueError as exc:
                raise ValueError('Invalid age') from exc
            if not math.isfinite(number) or not 0 <= number <= 150:
                raise ValueError('Invalid age')
            age = int(number)
        dob, sex, update = field('dob'), field('sex'), field('update')
        if dob:
            date.fromisoformat(dob)
        if sex not in ('', 'm', 'f') or (update and not update.isdecimal()):
            raise ValueError('Invalid sex or source revision')
        record_id = field('id')
        if not record_id:
            identity = json.dumps([ar_name, en_name, dob, sex], ensure_ascii=False)
            record_id = 'derived-' + hashlib.sha256(identity.encode()).hexdigest()[:24]
        if record_id in ids:
            raise ValueError('Duplicate record identifier')
        ids.add(record_id)
        records.append({'id': record_id, 'ar_name': ar_name, 'en_name': en_name,
                        'age': age, 'dob': dob or None, 'sex': sex or None, 'update': update or None})
    if not records:
        raise ValueError('Empty names list')
    return records


def download_csv() -> tuple[bytes, str | None]:
    request = urllib.request.Request(loader.SOURCE_URL, headers={
        'User-Agent': 'Mozilla/5.0 PalestineNamesArchive/1.0 (daily names-list sync)',
        'Accept': 'text/csv',
    })
    with urllib.request.urlopen(request, timeout=30) as response:
        payload = response.read(MAX_BYTES + 1)
        if len(payload) > MAX_BYTES:
            raise ValueError('Names list exceeds download limit')
        return payload, response.headers.get('Last-Modified')


def refresh_dataset() -> dict:
    try:
        payload, modified = download_csv()
        records = parse_csv(payload.decode('utf-8-sig'))
        digest = hashlib.sha256(payload).hexdigest()
        now = datetime.now(timezone.utc).isoformat()
        with loader._lock:
            previous = loader.get_snapshot()['metadata']
            metadata = {
                'origin': 'upstream', 'source_url': loader.SOURCE_URL,
                'source_docs': loader.SOURCE_DOCS, 'record_count': len(records),
                'source_revision': max((int(r['update']) for r in records if r['update']), default=None),
                'source_last_modified': modified, 'sha256': digest, 'checked_at': now,
                'refreshed_at': previous.get('refreshed_at') if previous.get('sha256') == digest else now,
            }
            loader.CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
            temp_path = None
            try:
                with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', dir=loader.CACHE_PATH.parent,
                                                 suffix='.tmp', delete=False) as output:
                    temp_path = output.name
                    json.dump({'metadata': metadata, 'records': records}, output, ensure_ascii=False, separators=(',', ':'))
                    output.flush()
                    os.fsync(output.fileno())
                os.replace(temp_path, loader.CACHE_PATH)
            finally:
                if temp_path and os.path.exists(temp_path):
                    os.unlink(temp_path)
            loader.reset_cache()
        log.info('Names snapshot checked: %s records; revision %s', len(records), metadata['source_revision'])
        return metadata
    except Exception:
        loader.note_refresh_failure()
        raise


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    refresh_dataset()
