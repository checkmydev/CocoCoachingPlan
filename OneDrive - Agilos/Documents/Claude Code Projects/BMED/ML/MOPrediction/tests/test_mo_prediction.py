import pandas as pd
import pytest
from pathlib import Path
import sys, os
sys.path.insert(0, str(Path(__file__).parent.parent))
import mo_prediction as mp


def _make_mo_csv(tmp_path, rows):
    path = tmp_path / "MO.csv"
    df = pd.DataFrame(rows)
    df.to_csv(path, sep=";", index=False)
    return str(path)


def _make_sales_csv(tmp_path, rows):
    path = tmp_path / "Sales.csv"
    df = pd.DataFrame(rows)
    df.to_csv(path, sep=";", index=False)
    return str(path)


def test_load_data_parses_dates(tmp_path):
    mo_rows = [{"MOCreatedDate": "01/01/2022 00:00:00", "NeededDate": "01/03/2022 00:00:00",
                "ScheduledDate": "", "LastReceiptDate": "", "MOStatus": 2,
                "ItemOrderedQuantity": 10, "ReceiptQuantity": 0,
                "WorkCenter": "2750", "Planner": "MBO",
                "FamilyItemNumber": "ML155SG", "ItemNumber": "991.6701.18",
                "MOLineStatus": "2", "MONumber": "MBO001"}]
    sales_rows = [{"Year": 2022, "Month": 1, "Quantity": 5,
                   "FSFamilyItemNumber": "ML155SG", "ItemNumber": "991.6701.18"}]
    mo_path = _make_mo_csv(tmp_path, mo_rows)
    sales_path = _make_sales_csv(tmp_path, sales_rows)

    mo, sales = mp.load_data(mo_path, sales_path)

    assert pd.api.types.is_datetime64_any_dtype(mo["MOCreatedDate"])
    assert pd.api.types.is_datetime64_any_dtype(mo["NeededDate"])
    assert mo["ItemOrderedQuantity"].dtype == float
    assert len(mo) == 1
    assert len(sales) == 1


def _make_mo_df(**overrides):
    base = {
        "MOCreatedDate": pd.Timestamp("2022-01-01"),
        "NeededDate":    pd.Timestamp("2022-03-01"),
        "ScheduledDate": pd.Timestamp("2022-02-20"),
        "LastReceiptDate": pd.Timestamp("2022-03-08"),
        "ItemOrderedQuantity": 10.0,
        "ReceiptQuantity": 5.0,
        "WorkCenter": "2750",
        "Planner": "MBO",
        "FamilyItemNumber": "ML155SG",
        "MOLineStatus": "2",
        "MOStatus": 2,
        "MONumber": "MBO001",
        "ItemNumber": "991.6701.18",
    }
    base.update(overrides)
    return pd.DataFrame([base])


def test_build_lateness_features_values():
    mo = _make_mo_df()
    feat = mp.build_lateness_features(mo)

    assert feat["DaysOrderedToNeeded"].iloc[0] == 59   # 01/01 → 01/03
    assert feat["DaysScheduledToNeeded"].iloc[0] == 9  # 20/02 → 01/03
    assert feat["ReceivedPct"].iloc[0] == pytest.approx(0.5)
    assert feat["NeededMonth"].iloc[0] == 3
    assert feat["NeededQuarter"].iloc[0] == 1
    assert feat["WorkCenter"].iloc[0] == "2750"


def test_make_lateness_label_late():
    mo = _make_mo_df(LastReceiptDate=pd.Timestamp("2022-03-08"), NeededDate=pd.Timestamp("2022-03-01"))
    # DaysLate = 7 > 5 → IsLate = 1
    label = mp.make_lateness_label(mo)
    assert label.iloc[0] == 1


def test_make_lateness_label_on_time():
    mo = _make_mo_df(LastReceiptDate=pd.Timestamp("2022-03-03"), NeededDate=pd.Timestamp("2022-03-01"))
    # DaysLate = 2 <= 5 → IsLate = 0
    label = mp.make_lateness_label(mo)
    assert label.iloc[0] == 0
