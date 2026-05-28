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
import re
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
    # Avertir et exclure les lignes avec _Year/_Month manquants
    null_mask = sales["_Year"].isna() | sales["_Month"].isna()
    if null_mask.any():
        log.warning("build_demand_series : %d lignes ignorées (_Year/_Month nuls)", null_mask.sum())
    sales = sales[~null_mask]

    series = {}
    grouped = sales.groupby([segment_col, "_Year", "_Month"])["Quantity"].sum().reset_index()
    grouped = grouped.rename(columns={"Quantity": "y"})
    grouped["ds"] = pd.to_datetime(
        grouped["_Year"].astype(int).astype(str) + "-" +
        grouped["_Month"].astype(int).astype(str).str.zfill(2) + "-01"
    )
    grouped = grouped.sort_values(["ds"]).reset_index(drop=True)

    for seg_val, grp in grouped.groupby(segment_col):
        grp = grp[["ds", "y"]].reset_index(drop=True)
        # Réindexer sur une plage mensuelle complète pour corriger les lags sur mois manquants
        full_idx = pd.date_range(grp["ds"].min(), grp["ds"].max(), freq="MS")
        grp = grp.set_index("ds").reindex(full_idx).rename_axis("ds").reset_index()
        grp["y"] = grp["y"].fillna(0.0)
        grp["_Year"]  = grp["ds"].dt.year
        grp["_Month"] = grp["ds"].dt.month
        series[seg_val] = grp[["ds", "y", "_Year", "_Month"]]

    log.info("Demande agrégée : %d segments (colonne '%s')", len(series), segment_col)
    return series


# ---------------------------------------------------------------------------
# DEMAND FORECASTING
# ---------------------------------------------------------------------------
_LAG_COLS = ["lag_1", "lag_3", "lag_12", "rolling_3", "month", "quarter", "year"]


def _build_lag_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy().sort_values("ds").reset_index(drop=True)
    df["lag_1"]     = df["y"].shift(1)
    df["lag_3"]     = df["y"].shift(3)
    df["lag_12"]    = df["y"].shift(12)
    df["rolling_3"] = df["y"].shift(1).rolling(3).mean()
    df["month"]   = df["ds"].dt.month
    df["quarter"] = df["ds"].dt.quarter
    df["year"]    = df["ds"].dt.year
    return df


def _select_best_model(train: pd.DataFrame, test: pd.DataFrame):
    """Essaie chaque algo disponible, retourne (modèle refitté sur tout, MAE_test)."""
    valid = train.dropna(subset=_LAG_COLS)
    if len(valid) < 5:
        return None, float("inf")

    X_tr, y_tr = valid[_LAG_COLS], valid["y"]
    X_te = test.dropna(subset=_LAG_COLS)
    if X_te.empty:
        return None, float("inf")
    y_te = X_te["y"]
    X_te = X_te[_LAG_COLS]

    candidates = [
        ("ridge", Pipeline([("sc", StandardScaler()), ("m", Ridge())])),
        ("rf",    RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)),
    ]
    if HAS_XGB:
        candidates.insert(0, ("xgb", xgb.XGBRegressor(n_estimators=100, random_state=42, verbosity=0)))
    if HAS_LGB:
        candidates.insert(0, ("lgb", lgb.LGBMRegressor(n_estimators=100, random_state=42, verbose=-1)))

    best_model, best_mae = None, float("inf")
    for name, m in candidates:
        try:
            m.fit(X_tr, y_tr)
            mae = mean_absolute_error(y_te, m.predict(X_te))
            log.info("    %s  MAE=%.2f", name, mae)
            if mae < best_mae:
                best_mae, best_model = mae, m
        except Exception as e:
            log.warning("    %s échoué : %s", name, e)

    if best_model is not None:
        X_all = pd.concat([X_tr, X_te]).reset_index(drop=True)
        y_all = pd.concat([y_tr, y_te]).reset_index(drop=True)
        best_model.fit(X_all, y_all)

    return best_model, best_mae


def _forecast_recursive(model, history: list, n_months: int,
                        last_date: pd.Timestamp) -> pd.DataFrame:
    """Prévision récursive mois par mois à partir de l'historique."""
    preds = []
    hist = list(history)
    for i in range(n_months):
        future_date = last_date + pd.DateOffset(months=i + 1)
        lag_1     = hist[-1]  if len(hist) >= 1  else np.nan
        lag_3     = hist[-3]  if len(hist) >= 3  else np.nan
        lag_12    = hist[-12] if len(hist) >= 12 else np.nan
        rolling_3 = float(np.mean(hist[-3:])) if len(hist) >= 3 else np.nan
        X = pd.DataFrame([{
            "lag_1": lag_1, "lag_3": lag_3, "lag_12": lag_12,
            "rolling_3": rolling_3,
            "month": future_date.month, "quarter": future_date.quarter,
            "year": future_date.year,
        }])
        pred = max(0.0, float(model.predict(X)[0]))
        preds.append({
            "ds": future_date,
            "_Year":  future_date.year,
            "_Month": future_date.month,
            "ForecastedDemand": round(pred, 2),
        })
        hist.append(pred)
    return pd.DataFrame(preds)


def forecast_demand(series_dict: dict, forecast_months: int,
                    min_months: int, test_months: int,
                    segment_col: str = MO_SEGMENT_COL) -> pd.DataFrame:
    """Lance la prévision pour chaque segment. Retourne un DataFrame consolidé."""
    all_preds = []
    for seg_val, df in series_dict.items():
        log.info("Prévision segment : %s (%d mois d'historique)", seg_val, len(df))

        if len(df) < min_months:
            log.warning("  → Historique insuffisant (%d < %d), moyenne utilisée.", len(df), min_months)
            avg = df["y"].mean()
            last_date = df["ds"].max()
            for i in range(forecast_months):
                fd = last_date + pd.DateOffset(months=i + 1)
                all_preds.append({
                    segment_col: seg_val,
                    "_Year": fd.year, "_Month": fd.month,
                    "ForecastedDemand": round(avg, 2),
                })
            continue

        df_lag = _build_lag_features(df)
        split  = len(df_lag) - test_months
        train  = df_lag.iloc[:split]
        test   = df_lag.iloc[split:]
        # Sous-ensemble valide pour évaluation ML (sans NaN dans les lags)
        test_valid = test.dropna(subset=_LAG_COLS)

        # Essai Prophet si disponible et assez de données
        prophet_model, prophet_mae = None, float("inf")
        if HAS_PROPHET and len(df) >= 36 and not test_valid.empty:
            try:
                m = Prophet(yearly_seasonality=True, weekly_seasonality=False,
                            daily_seasonality=False, changepoint_prior_scale=0.05)
                m.fit(df[["ds", "y"]])
                future = m.make_future_dataframe(periods=len(df) + test_months, freq="MS")
                fc = m.predict(future)
                # Aligner Prophet sur les mêmes mois que test_valid (équitable vs ML)
                valid_periods = test_valid["ds"].dt.to_period("M")
                fc_aligned = fc[fc["ds"].dt.to_period("M").isin(valid_periods)]
                if len(fc_aligned) == len(test_valid):
                    prophet_mae = mean_absolute_error(
                        test_valid["y"].values, fc_aligned["yhat"].values
                    )
                    prophet_model = m
                    log.info("    prophet  MAE=%.2f", prophet_mae)
            except Exception as e:
                log.warning("    prophet échoué : %s", e)

        best_model, best_mae = _select_best_model(train, test)

        history = list(df["y"].values)
        last_date = df["ds"].max()

        if prophet_model is not None and prophet_mae < best_mae:
            future = prophet_model.make_future_dataframe(
                periods=len(df) + forecast_months, freq="MS")
            fc = prophet_model.predict(future).tail(forecast_months)
            rows = fc[["ds", "yhat"]].copy()
            rows["yhat"] = rows["yhat"].clip(lower=0).round(2)
            for _, r in rows.iterrows():
                all_preds.append({
                    segment_col: seg_val,
                    "_Year": r["ds"].year, "_Month": r["ds"].month,
                    "ForecastedDemand": r["yhat"],
                })
        elif best_model is not None:
            preds_df = _forecast_recursive(best_model, history, forecast_months, last_date)
            preds_df[segment_col] = seg_val
            all_preds.extend(preds_df.to_dict("records"))
        else:
            log.warning("  → Aucun modèle disponible pour %s", seg_val)

    if not all_preds:
        return pd.DataFrame(columns=[segment_col, "_Year", "_Month", "ForecastedDemand"])
    return pd.DataFrame(all_preds)


# ---------------------------------------------------------------------------
# GAP ANALYSIS
# ---------------------------------------------------------------------------
def compute_gap(forecast_df: pd.DataFrame, open_mo: pd.DataFrame) -> pd.DataFrame:
    """Joint les prévisions avec les MOs déjà planifiés pour calculer le ProductionGap."""
    def _zero_gap(df):
        df = df.copy()
        df["PlannedMOQty"] = 0.0
        df["ProductionGap"] = df["ForecastedDemand"]
        return df

    if open_mo.empty or "NeededDate" not in open_mo.columns:
        return _zero_gap(forecast_df)
    if MO_SEGMENT_COL not in open_mo.columns:
        log.warning("compute_gap : colonne '%s' absente de open_mo — PlannedMOQty = 0", MO_SEGMENT_COL)
        return _zero_gap(forecast_df)

    mo_agg = open_mo.copy()
    mo_agg["_Year"]  = mo_agg["NeededDate"].dt.year
    mo_agg["_Month"] = mo_agg["NeededDate"].dt.month
    mo_agg["ItemOrderedQuantity"] = pd.to_numeric(
        mo_agg["ItemOrderedQuantity"], errors="coerce"
    ).fillna(0)

    planned = (
        mo_agg.groupby([MO_SEGMENT_COL, "_Year", "_Month"])["ItemOrderedQuantity"]
        .sum()
        .reset_index()
        .rename(columns={"ItemOrderedQuantity": "PlannedMOQty"})
    )

    result = forecast_df.merge(planned, on=[MO_SEGMENT_COL, "_Year", "_Month"], how="left")
    result["PlannedMOQty"]   = result["PlannedMOQty"].fillna(0.0)
    result["ProductionGap"]  = result["ForecastedDemand"] - result["PlannedMOQty"]

    log.info("Gap analysis : %d lignes famille/mois | Manque moyen : %.1f unités",
             len(result), result["ProductionGap"].clip(lower=0).mean())
    return result


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


# ---------------------------------------------------------------------------
# OUTPUT WRITING
# ---------------------------------------------------------------------------
def write_outputs(lateness_df: pd.DataFrame, gap_df: pd.DataFrame,
                  output_dir: str, run_date: str) -> None:
    """Écrit les deux CSVs et les graphiques de prévision."""
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)
    charts_dir = out / "charts"
    charts_dir.mkdir(exist_ok=True)

    # CSV 1 : prédictions retard MO
    late_path = out / f"mo_lateness_predictions_{run_date}.csv"
    lateness_df.to_csv(late_path, sep=";", index=False, encoding="utf-8-sig")
    log.info("Écrit : %s (%d lignes)", late_path, len(lateness_df))

    # CSV 2 : gap demande / production
    gap_path = out / f"mo_demand_gap_{run_date}.csv"
    gap_df.to_csv(gap_path, sep=";", index=False, encoding="utf-8-sig")
    log.info("Écrit : %s (%d lignes)", gap_path, len(gap_df))

    # Graphiques par famille
    if "ForecastedDemand" in gap_df.columns and MO_SEGMENT_COL in gap_df.columns:
        for seg_val, grp in gap_df.groupby(MO_SEGMENT_COL):
            fig, ax = plt.subplots(figsize=(10, 4))
            grp = grp.copy()
            grp["ds"] = pd.to_datetime(
                grp["_Year"].astype(int).astype(str) + "-" +
                grp["_Month"].astype(int).astype(str).str.zfill(2) + "-01"
            )
            ax.bar(grp["ds"], grp["PlannedMOQty"], label="MOs planifiés",
                   color="#4C72B0", alpha=0.7)
            ax.plot(grp["ds"], grp["ForecastedDemand"], "o-", color="#DD8452",
                    label="Demande prévue")
            ax.fill_between(
                grp["ds"],
                grp[["ForecastedDemand", "PlannedMOQty"]].min(axis=1),
                grp[["ForecastedDemand", "PlannedMOQty"]].max(axis=1),
                where=(grp["ProductionGap"] > 0), color="red", alpha=0.15, label="Manque"
            )
            ax.xaxis.set_major_formatter(mdates.DateFormatter("%b %Y"))
            ax.set_title(f"Demande vs Production planifiée — {seg_val}")
            ax.set_ylabel("Quantité")
            ax.legend()
            plt.tight_layout()
            safe_name = re.sub(r'[/\\:*?<>|]', '_', str(seg_val))
            fig.savefig(charts_dir / f"forecast_{safe_name}.png", dpi=100)
            plt.close(fig)
        log.info("Graphiques écrits dans %s", charts_dir)
    else:
        log.info("Aucun graphique — colonnes ForecastedDemand/FamilyItemNumber absentes.")


# ---------------------------------------------------------------------------
# CLI & MAIN ORCHESTRATION
# ---------------------------------------------------------------------------
def parse_args():
    p = argparse.ArgumentParser(description="MO Prediction — retard + prévision quantités")
    p.add_argument("--mo",             default=MO_PATH,    help="Chemin MO.csv")
    p.add_argument("--sales",          default=SALES_PATH, help="Chemin Sales.csv")
    p.add_argument("--output",         default=OUTPUT_DIR, help="Dossier de sortie")
    p.add_argument("--no-cv",          action="store_true", help="Désactiver cross-validation")
    p.add_argument("--forecast-months",type=int, default=FORECAST_MONTHS,
                   help="Mois à prévoir (défaut: 6)")
    return p.parse_args()


def main():
    args = parse_args()

    log.info("=== MO Prediction démarré — %s ===", RUN_DATE)
    mo, sales = load_data(args.mo, args.sales)

    # ── Modèle 1 : Lateness ──────────────────────────────────────────────
    hist_mo = mo[
        (mo["MOStatus"].astype(str) == "2") &
        mo["LastReceiptDate"].notna() &
        mo["NeededDate"].notna()
    ].copy()

    open_mo = mo[
        (pd.to_numeric(mo["MOLineStatus"], errors="coerce").fillna(0).astype(int) < 5) &
        (mo["ReceiptQuantity"] < mo["ItemOrderedQuantity"]) &
        mo["NeededDate"].notna()
    ].copy()

    log.info("MOs historiques : %d | MOs ouverts : %d", len(hist_mo), len(open_mo))

    _LATENESS_EMPTY_COLS = [
        "MONumber", "ItemNumber", "FamilyItemNumber", "WorkCenter",
        "NeededDate", "ScheduledDate", "ItemOrderedQuantity", "ReceiptQuantity",
        "LateProbability", "LateRisk",
    ]
    lateness_df = pd.DataFrame(columns=_LATENESS_EMPTY_COLS)
    if len(hist_mo) >= 30:
        X = build_lateness_features(hist_mo)
        y = make_lateness_label(hist_mo)
        valid = y.notna() & X[NUMERIC_FEATURES].notna().all(axis=1)
        X, y = X[valid], y[valid]
        if len(y) >= 30:
            model = train_lateness_model(X, y, cv=not args.no_cv)
            lateness_df = predict_lateness(model, open_mo)
        else:
            log.warning("Pas assez de MOs historiques valides (%d) — modèle lateness ignoré.", len(y))
    else:
        log.warning("Pas assez de MOs historiques (%d) — modèle lateness ignoré.", len(hist_mo))

    # ── Modèle 2 : Demand Forecast ───────────────────────────────────────
    n_forecast = args.forecast_months
    series = build_demand_series(sales, SALES_SEGMENT_COL)
    forecast_df = forecast_demand(series, n_forecast, MIN_MONTHS, TEST_MONTHS,
                                  segment_col=MO_SEGMENT_COL)

    # ── Gap analysis ─────────────────────────────────────────────────────
    gap_df = compute_gap(forecast_df, open_mo)

    # ── Outputs ──────────────────────────────────────────────────────────
    write_outputs(lateness_df, gap_df, args.output, RUN_DATE)
    log.info("=== Terminé ===")


if __name__ == "__main__":
    main()
