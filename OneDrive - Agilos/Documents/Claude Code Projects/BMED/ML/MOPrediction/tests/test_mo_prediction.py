import numpy as np
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


def _make_training_mo(n=60):
    """Génère n MOs historiques avec IsLate aléatoire mais reproductible."""
    rng = np.random.default_rng(42)
    records = []
    for i in range(n):
        created  = pd.Timestamp("2021-01-01") + pd.Timedelta(days=int(rng.integers(0, 300)))
        needed   = created + pd.Timedelta(days=int(rng.integers(10, 90)))
        sched    = needed - pd.Timedelta(days=int(rng.integers(0, 15)))
        delay    = int(rng.integers(-3, 20))
        received = needed + pd.Timedelta(days=delay)
        records.append({
            "MOCreatedDate": created, "NeededDate": needed,
            "ScheduledDate": sched, "LastReceiptDate": received,
            "ItemOrderedQuantity": float(rng.integers(1, 50)),
            "ReceiptQuantity": float(rng.integers(0, 50)),
            "WorkCenter": rng.choice(["2500", "2750", "2700"]),
            "Planner": rng.choice(["MBO", "MLK"]),
            "FamilyItemNumber": rng.choice(["ML155SG", "ML355S", "MT8"]),
            "MOLineStatus": "2", "MOStatus": 2,
            "MONumber": f"MBO{i:04d}", "ItemNumber": "991.0000.00",
        })
    return pd.DataFrame(records)


def test_train_lateness_model_returns_pipeline():
    mo = _make_training_mo(60)
    X = mp.build_lateness_features(mo)
    y = mp.make_lateness_label(mo)
    model = mp.train_lateness_model(X, y, cv=False)
    assert hasattr(model, "predict_proba")


def test_predict_lateness_output_shape():
    mo = _make_training_mo(60)
    X = mp.build_lateness_features(mo)
    y = mp.make_lateness_label(mo)
    model = mp.train_lateness_model(X, y, cv=False)

    open_mo = _make_training_mo(10)
    result = mp.predict_lateness(model, open_mo)

    assert len(result) == 10
    assert "LateProbability" in result.columns
    assert "LateRisk" in result.columns
    assert result["LateProbability"].between(0, 1).all()
    assert set(result["LateRisk"].unique()).issubset({"Low", "Medium", "High"})


def test_build_demand_series():
    sales = pd.DataFrame({
        "FSFamilyItemNumber": ["ML155SG", "ML155SG", "ML355S"],
        "_Year":  [2022, 2022, 2022],
        "_Month": [1,    2,    1   ],
        "Quantity": [10.0, 15.0, 5.0],
    })
    series = mp.build_demand_series(sales, "FSFamilyItemNumber")

    assert "ML155SG" in series
    assert "ML355S"  in series
    ml155 = series["ML155SG"]
    assert len(ml155) == 2
    assert ml155.loc[ml155["_Month"] == 1, "y"].iloc[0] == pytest.approx(10.0)
    assert "ds" in ml155.columns


def test_build_lag_features():
    df = pd.DataFrame({
        "ds": pd.date_range("2020-01-01", periods=15, freq="MS"),
        "y": list(range(15)),
        "_Year":  [d.year for d in pd.date_range("2020-01-01", periods=15, freq="MS")],
        "_Month": [d.month for d in pd.date_range("2020-01-01", periods=15, freq="MS")],
    })
    out = mp._build_lag_features(df)
    assert "lag_1"    in out.columns
    assert "lag_12"   in out.columns
    assert "rolling_3" in out.columns
    # La 14e ligne (index 13) doit avoir lag_1 = 12
    assert out["lag_1"].iloc[13] == pytest.approx(12.0)
    # Les 12 premières lignes ont lag_12 = NaN
    assert out["lag_12"].iloc[0] != out["lag_12"].iloc[0]  # NaN check
