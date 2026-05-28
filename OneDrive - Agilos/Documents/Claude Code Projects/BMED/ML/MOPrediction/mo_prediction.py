"""
mo_prediction.py

Lit MO.csv (Manufacturing Orders) et Sales.csv (Customer Orders), entraîne :
  - Un Random Forest pour prédire si un MO ouvert sera en retard
  - Des modèles de time series pour prévoir la demande future par famille produit
Génère deux CSVs pour Qlik Sense.

Usage:
    python mo_prediction.py
    python mo_prediction.py --mo "chemin/MO.csv" --sales "chemin/Sales.csv"
    python mo_prediction.py --no-cv --forecast-months 3
"""

import argparse
import logging
import os
import sys
import warnings
from datetime import date
from pathlib import Path

warnings.filterwarnings("ignore")

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OrdinalEncoder, StandardScaler

try:
    import lightgbm as lgb
    HAS_LGB = True
except ImportError:
    HAS_LGB = False

try:
    import xgboost as xgb
    HAS_XGB = True
except ImportError:
    HAS_XGB = False

try:
    from prophet import Prophet
    HAS_PROPHET = True
except ImportError:
    HAS_PROPHET = False

# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------
MO_PATH    = os.getenv("ML_MO_INPUT",    r"\\app10\E$\Data\8_ML\MOPrediction\data\MO.csv")
SALES_PATH = os.getenv("ML_SALES_INPUT", r"\\app10\E$\Data\8_ML\MOPrediction\data\Sales.csv")
OUTPUT_DIR = os.getenv("ML_OUTPUT",      r"\\app10\E$\Data\8_ML\MOPrediction\output")

FORECAST_MONTHS     = 6
MIN_MONTHS          = 24
TEST_MONTHS         = 12
LATE_THRESHOLD_DAYS = 5
LATE_RISK_HIGH      = 0.60
LATE_RISK_MEDIUM    = 0.35
USE_FISCAL_YEAR     = False

# Colonne segment dans Sales.csv → correspond à FamilyItemNumber dans MO.csv
SALES_SEGMENT_COL = "FSFamilyItemNumber"
MO_SEGMENT_COL    = "FamilyItemNumber"

# ---------------------------------------------------------------------------
# FEATURES
# ---------------------------------------------------------------------------
NUMERIC_FEATURES = [
    "DaysOrderedToNeeded",
    "DaysScheduledToNeeded",
    "ItemOrderedQuantity",
    "ReceivedPct",
    "NeededMonth",
    "NeededQuarter",
]

CATEGORICAL_FEATURES = [
    "WorkCenter",
    "Planner",
    "FamilyItemNumber",
]

# ---------------------------------------------------------------------------
# LOGGING
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)

RUN_DATE = date.today().strftime("%Y-%m-%d")

DATE_COLS_MO = [
    "MOCreatedDate", "MOLastMaintainedDate", "StartDate", "NeededDate",
    "ScheduledDate", "LastReceiptDate", "MOLineClosedDate",
]

# ---------------------------------------------------------------------------
# DATA LOADING
# ---------------------------------------------------------------------------
def _parse_dates(df: pd.DataFrame, cols: list) -> pd.DataFrame:
    """Convertit les colonnes de dates en format datetime64. Retourne une copie."""
    df = df.copy()
    for col in cols:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], dayfirst=True, errors="coerce")
    return df


def load_data(mo_path: str, sales_path: str):
    """Charge MO.csv et Sales.csv, parse les dates, normalise les numériques."""
    # Charger MO.csv avec fallback d'encodage
    mo = None
    for enc in ("utf-8-sig", "latin-1", "utf-8"):
        try:
            mo = pd.read_csv(mo_path, sep=";", encoding=enc, low_memory=False)
            break
        except UnicodeDecodeError:
            continue
    if mo is None:
        raise ValueError(f"Impossible de lire {mo_path}")

    # Parser les dates
    mo = _parse_dates(mo, DATE_COLS_MO)

    # Normaliser les colonnes numériques
    for col in ["ItemOrderedQuantity", "ReceiptQuantity"]:
        if col in mo.columns:
            mo[col] = pd.to_numeric(mo[col], errors="coerce").fillna(0.0).astype(float)

    # Assurer que MOLineStatus est une chaîne sans valeurs "nan"
    if "MOLineStatus" not in mo.columns:
        mo["MOLineStatus"] = ""
    mo["MOLineStatus"] = (
        mo["MOLineStatus"].fillna("").astype(str).replace({"nan": "", "None": ""})
    )

    # Charger Sales.csv avec fallback d'encodage
    sales = None
    for enc in ("utf-8-sig", "latin-1", "utf-8"):
        try:
            sales = pd.read_csv(sales_path, sep=";", encoding=enc, low_memory=False)
            break
        except UnicodeDecodeError:
            continue
    if sales is None:
        raise ValueError(f"Impossible de lire {sales_path}")

    # Normaliser Quantity
    if "Quantity" not in sales.columns:
        sales["Quantity"] = 0.0
    else:
        sales["Quantity"] = pd.to_numeric(sales["Quantity"], errors="coerce").fillna(0.0)

    # Gérer Year et Month (avec fallback pour année fiscale)
    year_col = "Year_Fiscal" if USE_FISCAL_YEAR and "Year_Fiscal" in sales.columns else "Year"
    month_col = "Month_Fiscal" if USE_FISCAL_YEAR and "Month_Fiscal" in sales.columns else "Month"
    for col in (year_col, month_col):
        if col not in sales.columns:
            raise ValueError(f"Sales.csv : colonne obligatoire manquante — '{col}'")
    sales["_Year"]  = pd.to_numeric(sales[year_col],  errors="coerce")
    sales["_Month"] = pd.to_numeric(sales[month_col], errors="coerce")

    log.info("MO chargé : %d lignes | Sales chargé : %d lignes", len(mo), len(sales))
    return mo, sales


# ---------------------------------------------------------------------------
# FEATURE ENGINEERING
# ---------------------------------------------------------------------------
def build_lateness_features(df: pd.DataFrame) -> pd.DataFrame:
    """Calcule les features pour le modèle de prédiction de retard.

    Retourne un DataFrame avec les colonnes :
      - NUMERIC_FEATURES: DaysOrderedToNeeded, DaysScheduledToNeeded,
                          ItemOrderedQuantity, ReceivedPct, NeededMonth, NeededQuarter
      - CATEGORICAL_FEATURES: WorkCenter, Planner, FamilyItemNumber
    """
    feat = pd.DataFrame(index=df.index)

    # Numeric features
    feat["DaysOrderedToNeeded"]   = (df["NeededDate"] - df["MOCreatedDate"]).dt.days
    feat["DaysScheduledToNeeded"] = (df["NeededDate"] - df["ScheduledDate"]).dt.days
    feat["ItemOrderedQuantity"]   = pd.to_numeric(df["ItemOrderedQuantity"], errors="coerce")

    # ReceivedPct = ReceiptQuantity / ItemOrderedQuantity
    ordered  = pd.to_numeric(df["ItemOrderedQuantity"], errors="coerce").replace(0, np.nan)
    received = pd.to_numeric(df["ReceiptQuantity"],     errors="coerce").fillna(0)
    feat["ReceivedPct"]   = (received / ordered).fillna(0).clip(0, 1)

    # Temporal features
    feat["NeededMonth"]   = df["NeededDate"].dt.month
    feat["NeededQuarter"] = df["NeededDate"].dt.quarter

    # Categorical features — fillna avant astype(str) pour éviter "nan" string
    for cat_col in ["WorkCenter", "Planner"]:
        feat[cat_col] = df[cat_col].where(df[cat_col].notna(), "UNKNOWN").astype(str)
    if "FamilyItemNumber" in df.columns:
        feat["FamilyItemNumber"] = df["FamilyItemNumber"].where(
            df["FamilyItemNumber"].notna(), "UNKNOWN"
        ).astype(str)
    else:
        feat["FamilyItemNumber"] = "UNKNOWN"

    return feat


def make_lateness_label(df: pd.DataFrame) -> pd.Series:
    """Crée le label de retard : IsLate = 1 si LastReceiptDate - NeededDate > LATE_THRESHOLD_DAYS."""
    days_late = (df["LastReceiptDate"] - df["NeededDate"]).dt.days
    return (days_late > LATE_THRESHOLD_DAYS).astype(int)


# ---------------------------------------------------------------------------
# MODEL : LATENESS
# ---------------------------------------------------------------------------
def train_lateness_model(X: pd.DataFrame, y: pd.Series, cv: bool = True) -> Pipeline:
    """Entraîne un RandomForest sur les MOs historiques."""
    num_pipe = Pipeline([("impute", SimpleImputer(strategy="median"))])
    cat_pipe = Pipeline([
        ("impute", SimpleImputer(strategy="most_frequent")),
        ("encode", OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1)),
    ])
    pre = ColumnTransformer([
        ("num", num_pipe, NUMERIC_FEATURES),
        ("cat", cat_pipe, CATEGORICAL_FEATURES),
    ])
    model = Pipeline([
        ("pre", pre),
        ("clf", RandomForestClassifier(
            n_estimators=200, class_weight="balanced", random_state=42, n_jobs=-1
        )),
    ])
    if cv and len(y) >= 10:
        scores = cross_val_score(model, X, y, cv=5, scoring="roc_auc")
        log.info("Lateness CV AUC : %.3f ± %.3f", scores.mean(), scores.std())
    model.fit(X, y)
    log.info("Lateness model entraîné sur %d MOs historiques (IsLate=%.1f%%)",
             len(y), y.mean() * 100)
    return model


# ---------------------------------------------------------------------------
# DEMAND AGGREGATION
# ---------------------------------------------------------------------------
def build_demand_series(sales: pd.DataFrame, segment_col: str) -> dict:
    """Agrège les ventes par segment + mois. Retourne {segment_value: DataFrame(ds, y, _Year, _Month)}."""
    series = {}
    grouped = sales.groupby([segment_col, "_Year", "_Month"])["Quantity"].sum().reset_index()
    grouped = grouped.rename(columns={"Quantity": "y", "_Year": "_Year", "_Month": "_Month"})
    grouped["ds"] = pd.to_datetime(
        grouped["_Year"].astype(int).astype(str) + "-" +
        grouped["_Month"].astype(int).astype(str).str.zfill(2) + "-01"
    )
    grouped = grouped.sort_values(["ds"]).reset_index(drop=True)

    for seg_val, grp in grouped.groupby(segment_col):
        series[seg_val] = grp[["ds", "y", "_Year", "_Month"]].reset_index(drop=True)

    log.info("Demande agrégée : %d segments (colonne '%s')", len(series), segment_col)
    return series


def predict_lateness(model: Pipeline, open_mo: pd.DataFrame) -> pd.DataFrame:
    """Applique le modèle aux MOs ouverts. Retourne un DataFrame avec LateProbability."""
    if len(open_mo) == 0:
        log.warning("Aucun MO ouvert trouvé — fichier de prédiction sera vide.")
        return pd.DataFrame(columns=[
            "MONumber", "ItemNumber", "FamilyItemNumber", "WorkCenter",
            "NeededDate", "ScheduledDate", "ItemOrderedQuantity", "ReceiptQuantity",
            "LateProbability", "LateRisk",
        ])
    features = build_lateness_features(open_mo)
    proba = model.predict_proba(features)[:, 1]

    keep_cols = [c for c in [
        "MONumber", "ItemNumber", "FamilyItemNumber", "WorkCenter",
        "NeededDate", "ScheduledDate", "ItemOrderedQuantity", "ReceiptQuantity",
    ] if c in open_mo.columns]
    result = open_mo[keep_cols].copy().reset_index(drop=True)
    result["LateProbability"] = proba.round(4)
    result["LateRisk"] = pd.cut(
        result["LateProbability"],
        bins=[-0.001, LATE_RISK_MEDIUM, LATE_RISK_HIGH, 1.001],
        labels=["Low", "Medium", "High"],
    ).astype(str)
    log.info("Prédiction retard : %d MOs ouverts — High=%.0f%% Medium=%.0f%% Low=%.0f%%",
             len(result),
             (result["LateRisk"] == "High").mean() * 100,
             (result["LateRisk"] == "Medium").mean() * 100,
             (result["LateRisk"] == "Low").mean() * 100)
    return result
