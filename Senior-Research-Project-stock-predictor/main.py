"""Main pipeline runner for feature extraction, training, and backtesting."""

from __future__ import annotations

import argparse
import time

import numpy as np
from tqdm import tqdm

from backtesting import TimeSeriesBacktester, summarize_results
from feature_extraction import StockFeatureExtractor
from fuzzy_lstm_model import build_fuzzy_model
from relu_lstm_model import build_relu_model


def load_or_build_dataset(dataset_path: str, refresh: bool) -> tuple[np.ndarray, np.ndarray]:
    if refresh:
        extractor = StockFeatureExtractor(ticker_file="stocks.txt", lookback_days=20, horizon_days=3)
        print("Extracting and normalizing features...")
        with tqdm(total=1, desc="Feature extraction") as pbar:
            output = extractor.save_dataset(dataset_path)
            pbar.update(1)
        print(f"Saved dataset at {output}")

    data = np.load(dataset_path, allow_pickle=True)
    return data["X"], data["y"]


def run_pipeline(dataset_path: str, refresh: bool, initial_train_size: int, test_window: int) -> None:
    start_time = time.perf_counter()

    X, y = load_or_build_dataset(dataset_path, refresh)
    print(f"Dataset loaded: X shape={X.shape}, y shape={y.shape}")

    backtester = TimeSeriesBacktester(test_window=test_window)
    results = {}

    print("\nRunning backtests...")
    for name, builder in tqdm(
        [("ReLU-LSTM", build_relu_model), ("Fuzzy-LSTM", build_fuzzy_model)],
        desc="Models",
    ):
        t0 = time.perf_counter()
        result = backtester.run(
            model_builder=builder,
            X=X,
            y=y,
            model_name=name,
            initial_train_size=initial_train_size,
        )
        results[name] = result
        elapsed = time.perf_counter() - t0
        print(f"Finished {name} in {elapsed:.1f}s")

    summarize_results(results)

    total = time.perf_counter() - start_time
    print(f"\nTotal runtime: {total:.1f}s")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Stock direction prediction backend runner")
    parser.add_argument("--dataset-path", default="data/processed/dataset.npz")
    parser.add_argument("--refresh-features", action="store_true", help="Rebuild dataset from raw Yahoo/FRED data")
    parser.add_argument("--initial-train-size", type=int, default=1000)
    parser.add_argument("--test-window", type=int, default=252)
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    run_pipeline(
        dataset_path=args.dataset_path,
        refresh=args.refresh_features,
        initial_train_size=args.initial_train_size,
        test_window=args.test_window,
    )
