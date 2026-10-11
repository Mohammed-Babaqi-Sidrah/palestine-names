"""
Search algorithms — manually implemented (not using Python builtins).

Three algorithms:
  1. linear_search_by_name  — O(n)       — sequential substring match
  2. binary_search_by_age   — O(log n)   — bisection on pre-sorted list
  3. linear_search_by_date  — O(n)       — sequential date-range scan
"""
import unicodedata
import bisect
from typing import Any


# ─── helpers ──────────────────────────────────────────────────────────────────

def _normalize(text: str) -> str:
    """Remove diacritics and lowercase for case-insensitive Arabic/Latin match."""
    nfkd = unicodedata.normalize("NFKD", text)
    return "".join(c for c in nfkd if not unicodedata.combining(c)).lower().replace('ـ', '').translate(str.maketrans({'ى': 'ي'}))


# ─── 1. Linear Search by Name ─────────────────────────────────────────────────

def linear_search_by_name(records: list[dict], query: str) -> dict:
    """
    Linear search — O(n)
    Scans every record and returns those whose Arabic or English name
    contains the query string (normalized, case-insensitive).
    """
    tokens = _normalize(query.strip()).split()
    results = []
    comparisons = 0

    for rec in records:
        comparisons += 1
        ar_norm = _normalize(rec.get("ar_name", "") or "")
        en_norm = _normalize(rec.get("en_name", "") or "")

        if all(token in ar_norm or token in en_norm for token in tokens):
            results.append(rec)

    return {
        "algorithm": "Linear Search",
        "complexity": "O(n)",
        "comparisons": comparisons,
        "results": results,
        "count": len(results),
    }


# ─── 2. Binary Search by Age ──────────────────────────────────────────────────

def binary_search_by_age(
    records: list[dict], target_age: int, tolerance: int = 0
) -> dict:
    """
    Binary search — O(log n)
    Requires records sorted by age. Uses bisect to find the left/right
    boundary of the target age (±tolerance).
    """
    # Build sorted key list (age values) from records that have an age
    valid = [(r["age"], r) for r in records if r.get("age") is not None]
    valid.sort(key=lambda x: x[0])

    ages = [v[0] for v in valid]

    lo = target_age - tolerance
    hi = target_age + tolerance

    left = bisect.bisect_left(ages, lo)
    right = bisect.bisect_right(ages, hi)

    # Steps = height of binary tree = log2(n)
    import math
    steps = max(1, math.ceil(math.log2(len(ages) + 1))) if ages else 0

    results = [v[1] for v in valid[left:right]]

    return {
        "algorithm": "Binary Search",
        "complexity": "O(log n)",
        "steps": steps,
        "results": results,
        "count": len(results),
        "target_age": target_age,
        "tolerance": tolerance,
    }


# ─── 3. Linear Search by Date ─────────────────────────────────────────────────

def linear_search_by_date(
    records: list[dict],
    date_from: str | None = None,
    date_to: str | None = None,
) -> dict:
    """
    Linear search — O(n)
    Scans every record for those whose dob falls within [date_from, date_to].
    Dates are ISO strings (YYYY-MM-DD).
    """
    results = []
    comparisons = 0

    for rec in records:
        comparisons += 1
        dob = rec.get("dob") or ""
        if not dob:
            continue

        if date_from and dob < date_from:
            continue
        if date_to and dob > date_to:
            continue

        results.append(rec)

    return {
        "algorithm": "Linear Search",
        "complexity": "O(n)",
        "comparisons": comparisons,
        "results": results,
        "count": len(results),
        "date_from": date_from,
        "date_to": date_to,
    }
