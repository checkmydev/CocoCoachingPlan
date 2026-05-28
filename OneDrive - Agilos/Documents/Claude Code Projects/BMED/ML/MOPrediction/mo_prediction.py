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
