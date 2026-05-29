"""Feature extraction pipeline for stock-direction prediction.

This module:
1) Reads stock tickers from a .txt file (one ticker per line).
2) Downloads market/fundamental data with yfinance.
3) Downloads macroeconomic features (interest rate, inflation, unemployment, GDP growth).
4) Builds a day-level feature matrix for each ticker.
5) Normalizes features to [0, 1] using min-max scaling or z-score + logistic squash.
6) Produces 20-day rolling windows with a 3-day directional target.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler, StandardScaler

try:
    from pandas_datareader import data as pdr
except Exception:  # pragma: no cover - optional dependency
    pdr = None


MACRO_FRED_SERIES = {
    "interest_rate": "FEDFUNDS",      # Effective Federal Funds Rate (monthly)
    "inflation": "CPIAUCSL",          # CPI index (monthly)
    "unemployment": "UNRATE",         # Unemployment rate (monthly)
    "gdp": "GDP",                     # GDP level (quarterly)
}


@dataclass
class DatasetBundle:
    X: np.ndarray
    y: np.ndarray
    meta: pd.DataFrame
    feature_names: List[str]


class StockFeatureExtractor:
    def __init__(
        self,
        ticker_file: str = "stocks.txt",
        lookback_days: int = 20,
        horizon_days: int = 3,
        start_date: str = "2012-01-01",
        end_date: Optional[str] = None,
    ) -> None:
        self.ticker_file = Path(ticker_file)
        self.lookback_days = lookback_days
        self.horizon_days = horizon_days
        self.start_date = pd.Timestamp(start_date)
        self.end_date = pd.Timestamp.today().normalize() if end_date is None else pd.Timestamp(end_date)

        self.feature_columns = [
            "macd",
            "rsi",
            "ma_50",
            "ma_200",
            "pe_sector_adjusted",
            "earnings_growth",
            "debt_to_equity",
            "interest_rate",
            "inflation_yoy",
            "unemployment",
            "gdp_growth_qoq",
        ]

    def load_tickers(self) -> List[str]:
        if not self.ticker_file.exists():
            raise FileNotFoundError(f"Ticker file not found: {self.ticker_file}")
        lines = [line.strip().upper() for line in self.ticker_file.read_text().splitlines() if line.strip()]
        if not lines:
            raise ValueError("Ticker file is empty.")
        return lines

    @staticmethod
    def _compute_rsi(close: pd.Series, window: int = 14) -> pd.Series:
        delta = close.diff()
        gain = delta.clip(lower=0)
        loss = -delta.clip(upper=0)
        avg_gain = gain.ewm(alpha=1 / window, min_periods=window, adjust=False).mean()
        avg_loss = loss.ewm(alpha=1 / window, min_periods=window, adjust=False).mean()
        rs = avg_gain / avg_loss.replace(0, np.nan)
        rsi = 100 - (100 / (1 + rs))
        return rsi.fillna(50.0)

    @staticmethod
    def _compute_macd(close: pd.Series) -> pd.Series:
        ema_fast = close.ewm(span=12, adjust=False).mean()
        ema_slow = close.ewm(span=26, adjust=False).mean()
        return ema_fast - ema_slow

    def _fetch_macro(self) -> pd.DataFrame:
        business_days = pd.date_range(self.start_date, self.end_date, freq="B")
        macro = pd.DataFrame(index=business_days)

        if pdr is None:
            # Fallback: if pandas_datareader isn't installed, return neutral constants.
            macro["interest_rate"] = 0.0
            macro["inflation"] = 0.0
            macro["unemployment"] = 0.0
            macro["gdp"] = 0.0
        else:
            for col, fred_series in MACRO_FRED_SERIES.items():
                s = pdr.DataReader(fred_series, "fred", self.start_date, self.end_date).rename(columns={fred_series: col})
                macro = macro.join(s, how="left")

        macro = macro.sort_index().ffill().bfill()
        macro["inflation_yoy"] = macro["inflation"].pct_change(12) * 100.0
        macro["gdp_growth_qoq"] = macro["gdp"].pct_change(1) * 100.0
        macro["inflation_yoy"] = macro["inflation_yoy"].replace([np.inf, -np.inf], np.nan).ffill().bfill().fillna(0.0)
        macro["gdp_growth_qoq"] = macro["gdp_growth_qoq"].replace([np.inf, -np.inf], np.nan).ffill().bfill().fillna(0.0)

        return macro[["interest_rate", "inflation_yoy", "unemployment", "gdp_growth_qoq"]]

    def _safe_info(self, ticker: yf.Ticker) -> Dict:
        try:
            return ticker.info or {}
        except Exception:
            return {}

    def _build_single_ticker_frame(self, symbol: str, macro: pd.DataFrame) -> pd.DataFrame:
        hist = yf.download(symbol, start=self.start_date, end=self.end_date + pd.Timedelta(days=1), auto_adjust=False, progress=False)
        if hist.empty:
            raise ValueError(f"No price history for {symbol}")

        hist = hist.rename(columns=str.lower)
        hist = hist[["open", "high", "low", "close", "volume"]].copy()
        hist["macd"] = self._compute_macd(hist["close"])
        hist["rsi"] = self._compute_rsi(hist["close"])
        hist["ma_50"] = hist["close"].rolling(50).mean()
        hist["ma_200"] = hist["close"].rolling(200).mean()

        ticker = yf.Ticker(symbol)
        info = self._safe_info(ticker)
        pe_ratio = info.get("trailingPE", np.nan)
        earnings_growth = info.get("earningsGrowth", np.nan)
        debt_to_equity = info.get("debtToEquity", np.nan)
        sector = info.get("sector", "UNKNOWN")

        hist["pe_ratio"] = pe_ratio
        hist["earnings_growth"] = earnings_growth
        hist["debt_to_equity"] = debt_to_equity
        hist["sector"] = sector
        hist["ticker"] = symbol

        frame = hist.join(macro, how="left")
        frame = frame.ffill().bfill()

        # 3-day directional target (1 = up, 0 = down or flat).
        future_close = frame["close"].shift(-self.horizon_days)
        frame["target"] = (future_close > frame["close"]).astype(int)

        return frame

    def _sector_adjust_pe(self, frames: Dict[str, pd.DataFrame]) -> Dict[str, pd.DataFrame]:
        full = pd.concat(frames.values(), axis=0)
        sector_median = full.groupby("sector")["pe_ratio"].median().replace(0, np.nan)

        adjusted = {}
        for sym, df in frames.items():
            df = df.copy()
            med = sector_median.get(df["sector"].iloc[0], np.nan)
            if np.isnan(med) or med == 0:
                df["pe_sector_adjusted"] = df["pe_ratio"].fillna(df["pe_ratio"].median())
            else:
                df["pe_sector_adjusted"] = df["pe_ratio"] / med
            adjusted[sym] = df
        return adjusted

    @staticmethod
    def _zscore_logistic(series: pd.Series) -> pd.Series:
        vals = series.astype(float).values.reshape(-1, 1)
        vals = np.nan_to_num(vals, nan=np.nanmedian(vals))
        z = StandardScaler().fit_transform(vals).ravel()
        return pd.Series(1.0 / (1.0 + np.exp(-z)), index=series.index)

    def _normalize_frame(self, df: pd.DataFrame) -> pd.DataFrame:
        out = df.copy()

        # Bounded indicators (easy [0,1] mapping)
        out["rsi"] = (out["rsi"].clip(0, 100)) / 100.0

        # Price-derived and macro -> min-max
        minmax_cols = ["macd", "ma_50", "ma_200", "interest_rate", "inflation_yoy", "unemployment", "gdp_growth_qoq"]
        for col in minmax_cols:
            scaler = MinMaxScaler()
            out[col] = scaler.fit_transform(out[[col]].astype(float)).ravel()

        # Fundamentally noisy ratios -> z-score then logistic squash to [0,1]
        z_cols = ["pe_sector_adjusted", "earnings_growth", "debt_to_equity"]
        for col in z_cols:
            out[col] = self._zscore_logistic(out[col])

        out = out.replace([np.inf, -np.inf], np.nan).ffill().bfill().fillna(0.0)
        return out

    def build_feature_table(self) -> pd.DataFrame:
        tickers = self.load_tickers()
        macro = self._fetch_macro()

        frames: Dict[str, pd.DataFrame] = {}
        for t in tickers:
            frames[t] = self._build_single_ticker_frame(t, macro)

        frames = self._sector_adjust_pe(frames)

        normalized_frames = []
        for t, df in frames.items():
            norm = self._normalize_frame(df)
            normalized_frames.append(norm)

        all_data = pd.concat(normalized_frames).sort_index()
        return all_data

    def make_sequence_dataset(self) -> DatasetBundle:
        all_data = self.build_feature_table()

        X_chunks: List[np.ndarray] = []
        y_vals: List[int] = []
        meta_rows = []

        for ticker, group in all_data.groupby("ticker"):
            group = group.sort_index().dropna(subset=self.feature_columns + ["target"])
            feat = group[self.feature_columns].values
            target = group["target"].values
            dates = group.index.to_numpy()

            for idx in range(self.lookback_days - 1, len(group) - self.horizon_days):
                start = idx - self.lookback_days + 1
                end = idx + 1
                X_chunks.append(feat[start:end])
                y_vals.append(int(target[idx]))
                meta_rows.append({"ticker": ticker, "asof_date": pd.Timestamp(dates[idx])})

        X = np.asarray(X_chunks, dtype=np.float32)
        y = np.asarray(y_vals, dtype=np.int64)
        meta = pd.DataFrame(meta_rows)
        return DatasetBundle(X=X, y=y, meta=meta, feature_names=self.feature_columns)

    def save_dataset(self, output_path: str = "data/processed/dataset.npz") -> str:
        bundle = self.make_sequence_dataset()
        out = Path(output_path)
        out.parent.mkdir(parents=True, exist_ok=True)

        np.savez_compressed(
            out,
            X=bundle.X,
            y=bundle.y,
            tickers=bundle.meta["ticker"].to_numpy(),
            dates=bundle.meta["asof_date"].astype(str).to_numpy(),
            feature_names=np.array(bundle.feature_names),
        )
        return str(out)


if __name__ == "__main__":
    extractor = StockFeatureExtractor(ticker_file="stocks.txt", lookback_days=20, horizon_days=3)
    path = extractor.save_dataset("data/processed/dataset.npz")
    print(f"Saved normalized sequence dataset to: {path}")
