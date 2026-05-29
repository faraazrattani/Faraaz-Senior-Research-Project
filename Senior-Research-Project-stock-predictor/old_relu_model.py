"""ReLU-LSTM model for 3-day directional stock movement prediction."""

from __future__ import annotations

import torch
import torch.nn as nn


class ReLULSTMClassifier(nn.Module):
    """A compact LSTM classifier.

    Architecture choice:
    - 2 stacked LSTM layers with hidden size 64 (common baseline for financial sequence tasks).
    - ReLU-activated MLP head.
    - Sigmoid output for binary direction prediction.
    """

    def __init__(self, input_size: int, hidden_size: int = 64, num_layers: int = 2, dropout: float = 0.2):
        super().__init__()
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0.0,
        )
        self.classifier = nn.Sequential(
            nn.Linear(hidden_size, 64),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(64, 1),
            nn.Sigmoid(),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x shape: (batch, seq_len=20, features)
        out, _ = self.lstm(x)
        last_hidden = out[:, -1, :]
        return self.classifier(last_hidden).squeeze(-1)


def build_relu_model(input_size: int) -> ReLULSTMClassifier:
    return ReLULSTMClassifier(input_size=input_size)
