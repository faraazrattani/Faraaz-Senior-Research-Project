"""Fuzzy-triangular activation LSTM model for stock direction prediction."""

from __future__ import annotations

import torch
import torch.nn as nn


class FuzzyTriangularActivation(nn.Module):
    """Triangular membership-style activation.

    mu(x) = max(0, 1 - |(x-c)/w|)
    where c is center and w is width (>0).
    """

    def __init__(self, center: float = 0.0, width: float = 1.0):
        super().__init__()
        self.center = nn.Parameter(torch.tensor(center, dtype=torch.float32))
        self.log_width = nn.Parameter(torch.log(torch.tensor(width, dtype=torch.float32)))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        width = torch.exp(self.log_width) + 1e-6
        membership = 1.0 - torch.abs((x - self.center) / width)
        return torch.clamp(membership, min=0.0, max=1.0)


class FuzzyLSTMClassifier(nn.Module):
    """Same architecture as ReLU model, fuzzy triangular activation in MLP head."""

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
            FuzzyTriangularActivation(center=0.0, width=1.0),
            nn.Dropout(dropout),
            nn.Linear(64, 1),
            nn.Sigmoid(),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        out, _ = self.lstm(x)
        last_hidden = out[:, -1, :]
        return self.classifier(last_hidden).squeeze(-1)


def build_fuzzy_model(input_size: int) -> FuzzyLSTMClassifier:
    return FuzzyLSTMClassifier(input_size=input_size)
