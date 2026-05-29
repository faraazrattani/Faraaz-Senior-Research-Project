"""Backtesting utilities for ReLU and fuzzy LSTM models."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Tuple

import numpy as np
import torch
import torch.nn as nn
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from torch.utils.data import DataLoader, TensorDataset
from tqdm import tqdm


@dataclass
class BacktestResult:
    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1: float


class ModelTrainer:
    def __init__(self, model: nn.Module, device: str = "cpu"):
        self.model = model.to(device)
        self.device = device
        self.criterion = nn.BCELoss()

    def fit(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        epochs: int = 20,
        batch_size: int = 64,
        lr: float = 1e-3,
    ) -> None:
        dataset = TensorDataset(
            torch.tensor(X_train, dtype=torch.float32),
            torch.tensor(y_train, dtype=torch.float32),
        )
        loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
        optimizer = torch.optim.Adam(self.model.parameters(), lr=lr)

        self.model.train()
        for epoch in range(1, epochs + 1):
            running_loss = 0.0
            for xb, yb in tqdm(loader, desc=f"Epoch {epoch}/{epochs}", leave=False):
                xb, yb = xb.to(self.device), yb.to(self.device)
                optimizer.zero_grad()
                preds = self.model(xb)
                loss = self.criterion(preds, yb)
                loss.backward()
                optimizer.step()
                running_loss += loss.item() * xb.size(0)

            avg_loss = running_loss / len(dataset)
            print(f"Epoch {epoch}/{epochs} - loss: {avg_loss:.5f}")

    @torch.no_grad()
    def predict(self, X: np.ndarray, batch_size: int = 256) -> np.ndarray:
        dataset = TensorDataset(torch.tensor(X, dtype=torch.float32))
        loader = DataLoader(dataset, batch_size=batch_size, shuffle=False)

        self.model.eval()
        probs = []
        for (xb,) in loader:
            xb = xb.to(self.device)
            p = self.model(xb).detach().cpu().numpy()
            probs.append(p)
        return np.concatenate(probs)


class TimeSeriesBacktester:
    """Simple walk-forward backtester.

    Uses an expanding train window and fixed-size test windows.
    """

    def __init__(self, test_window: int = 252):
        self.test_window = test_window

    def run(
        self,
        model_builder,
        X: np.ndarray,
        y: np.ndarray,
        model_name: str,
        initial_train_size: int = 1000,
    ) -> BacktestResult:
        preds_all = []
        trues_all = []

        split = initial_train_size
        while split + self.test_window <= len(X):
            X_train, y_train = X[:split], y[:split]
            X_test, y_test = X[split:split + self.test_window], y[split:split + self.test_window]

            model = model_builder(input_size=X.shape[-1])
            trainer = ModelTrainer(model)
            trainer.fit(X_train, y_train, epochs=8, batch_size=64, lr=1e-3)
            probs = trainer.predict(X_test)
            preds = (probs >= 0.5).astype(int)

            preds_all.append(preds)
            trues_all.append(y_test)
            split += self.test_window

        y_true = np.concatenate(trues_all)
        y_pred = np.concatenate(preds_all)

        return BacktestResult(
            model_name=model_name,
            accuracy=accuracy_score(y_true, y_pred),
            precision=precision_score(y_true, y_pred, zero_division=0),
            recall=recall_score(y_true, y_pred, zero_division=0),
            f1=f1_score(y_true, y_pred, zero_division=0),
        )


def chronological_split(
    X: np.ndarray,
    y: np.ndarray,
    train_ratio: float = 0.8,
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    split = int(len(X) * train_ratio)
    return X[:split], X[split:], y[:split], y[split:]


def summarize_results(results: Dict[str, BacktestResult]) -> None:
    print("\nBacktest summary")
    print("-" * 70)
    for _, r in results.items():
        print(
            f"{r.model_name:20s} | "
            f"acc={r.accuracy:.4f} "
            f"prec={r.precision:.4f} "
            f"rec={r.recall:.4f} "
            f"f1={r.f1:.4f}"
        )
