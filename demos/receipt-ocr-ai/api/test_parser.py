"""Unit tests for the heuristic parser (spec AC-3 shape, AC-5 fallback)."""
from parser import heuristic_structure

SAMPLE = """Coffee House
2026-01-15
Espresso 2.50
Croissant 3.25
Orange Juice 4.00
Total: 9.75
USD
"""


def test_extracts_merchant_from_first_line():
    assert heuristic_structure(SAMPLE)["merchant"] == "Coffee House"


def test_extracts_total():
    assert heuristic_structure(SAMPLE)["total"] == 9.75


def test_extracts_iso_date():
    assert heuristic_structure(SAMPLE)["date"] == "2026-01-15"


def test_extracts_currency():
    assert heuristic_structure(SAMPLE)["currency"] == "USD"


def test_extracts_line_items_without_total():
    items = heuristic_structure(SAMPLE)["items"]
    descriptions = [i["description"] for i in items]
    assert "Espresso" in descriptions
    assert "Croissant" in descriptions
    # the "Total" line must not be treated as an item
    assert all("Total" not in d for d in descriptions)


def test_structured_shape_has_required_keys():
    result = heuristic_structure(SAMPLE)
    assert set(result.keys()) >= {"merchant", "date", "currency", "total", "items"}
