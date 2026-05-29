"""Fuzzy-activation neural network definition."""

from tensorflow.keras import Sequential
from tensorflow.keras.layers import Dense


def build_fuzzy_activation_model(input_dim: int) -> Sequential:
    """Build the fuzzy-activation model architecture.

    Architecture:
    Input -> Dense(64, fuzzy_activation) -> Dense(32, fuzzy_activation)
    -> Dense(16, fuzzy_activation) -> Dense(1, sigmoid)
    """
    model = Sequential(
        [
            Dense(64, activation="fuzzy_activation", input_shape=(input_dim,)),
            Dense(32, activation="fuzzy_activation"),
            Dense(16, activation="fuzzy_activation"),
            Dense(1, activation="sigmoid"),
        ]
    )
    return model
