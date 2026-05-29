"""Baseline ReLU neural network definition."""

from tensorflow.keras import Sequential
from tensorflow.keras.layers import Dense


def build_baseline_model(input_dim: int) -> Sequential:
    """Build the baseline model architecture.

    Architecture:
    Input -> Dense(64, relu) -> Dense(32, relu)
    -> Dense(16, relu) -> Dense(1, sigmoid)
    """
    model = Sequential(
        [
            Dense(64, activation="relu", input_shape=(input_dim,)),
            Dense(32, activation="relu"),
            Dense(16, activation="relu"),
            Dense(1, activation="sigmoid"),
        ]
    )
    return model
