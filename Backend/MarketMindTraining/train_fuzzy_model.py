import time
import numpy as np
import pandas as pd
import yfinance as yf
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import warnings
warnings.filterwarnings("ignore")

# ── TIMER UTILITIES ────────────────────────────────────────────────────────────
overall_start = time.time()
stage_times = {}

def start_stage(name):
    print(f"\n{'='*60}")
    print(f"  STAGE: {name}")
    print(f"{'='*60}")
    stage_times[name] = time.time()
    return stage_times[name]

def end_stage(name):
    elapsed = time.time() - stage_times[name]
    print(f"  [DONE] {name} completed in {elapsed:.2f}s")
    return elapsed

def log(msg, indent=2):
    elapsed = time.time() - overall_start
    print(f"  {'  '*indent}[{elapsed:6.2f}s] {msg}")

def progress_bar(current, total, width=40):
    pct = current / total
    filled = int(width * pct)
    bar = "#" * filled + "-" * (width - filled)
    elapsed = time.time() - overall_start
    est = (elapsed / current * total) if current > 0 else 0
    remaining = max(0, est - elapsed)
    print(f"\r  [{bar}] {current}/{total} ({pct*100:.0f}%) | "
          f"Elapsed: {elapsed:.1f}s | ETA: {remaining:.1f}s", end="", flush=True)

# ==============================================================================
# STAGE 1 -- FETCH & PREPARE DATA
# ==============================================================================
start_stage("1 -- Fetching & Preparing Data")

TICKER  = "AAPL"
PERIOD  = "2y"
SEQ_LEN = 20   # how many past days the network looks back

log(f"Downloading {TICKER} ({PERIOD}) from Yahoo Finance...")
df_raw = yf.download(TICKER, period=PERIOD, progress=False)

# Fix: newer yfinance returns multi-level columns like ("Close", "AAPL")
if isinstance(df_raw.columns, pd.MultiIndex):
    df_raw.columns = df_raw.columns.get_level_values(0)

log(f"Downloaded {len(df_raw)} rows")

# Helper: always get a clean 1D numpy array from a column
def get_col(frame, name):
    c = frame[name]
    if isinstance(c, pd.DataFrame):
        c = c.iloc[:, 0]
    return np.array(c.squeeze(), dtype=np.float64)

log("Engineering features...")

Close  = get_col(df_raw, "Close")
High   = get_col(df_raw, "High")
Low    = get_col(df_raw, "Low")
Open_  = get_col(df_raw, "Open")
Volume = get_col(df_raw, "Volume")

# Rebuild a clean DataFrame from plain numpy arrays
df = pd.DataFrame(index=df_raw.index)
df["Close"]  = Close
df["High"]   = High
df["Low"]    = Low
df["Open"]   = Open_
df["Volume"] = Volume

# Price-based features
df["Return"]    = df["Close"].pct_change()
df["LogReturn"] = np.log(df["Close"] / df["Close"].shift(1))
df["HL_Range"]  = (df["High"] - df["Low"]) / df["Close"]
df["OC_Range"]  = (df["Close"] - df["Open"]) / df["Open"]

# Moving averages
df["MA5"]      = df["Close"].rolling(5).mean()
df["MA20"]     = df["Close"].rolling(20).mean()
df["MA50"]     = df["Close"].rolling(50).mean()
df["MA_Ratio"] = df["MA5"] / df["MA20"]

# RSI
def calc_rsi(s, period=14):
    delta = s.diff()
    gain  = delta.clip(lower=0).rolling(period).mean()
    loss  = -delta.clip(upper=0).rolling(period).mean()
    rs    = gain / (loss + 1e-9)
    return (100 - (100 / (1 + rs))) / 100.0

# MACD
def calc_macd(s):
    ema12  = s.ewm(span=12).mean()
    ema26  = s.ewm(span=26).mean()
    macd   = ema12 - ema26
    signal = macd.ewm(span=9).mean()
    return macd, signal

# Bollinger Bands
def calc_bollinger(s, period=20):
    ma  = s.rolling(period).mean()
    std = s.rolling(period).std()
    return (s - ma) / (std + 1e-9)

df["RSI"] = calc_rsi(df["Close"])
macd_line, macd_sig = calc_macd(df["Close"])
df["MACD"]        = macd_line / (df["Close"] + 1e-9)
df["MACD_Signal"] = macd_sig  / (df["Close"] + 1e-9)
df["BB_Pos"]      = calc_bollinger(df["Close"])
df["Volume_MA"]   = df["Volume"].rolling(20).mean()
df["Volume_Ratio"]= df["Volume"] / (df["Volume_MA"] + 1e-9)

df.dropna(inplace=True)
log(f"Features engineered. Dataset: {len(df)} rows x {len(df.columns)} cols")

# Target: will price be higher in 5 days?
df["Target"] = (df["Close"].shift(-5) > df["Close"]).astype(float)
df.dropna(inplace=True)
log(f"Target created. Final dataset: {len(df)} rows")

FEATURES = ["Return", "LogReturn", "HL_Range", "OC_Range",
            "MA_Ratio", "RSI", "MACD", "MACD_Signal",
            "BB_Pos", "Volume_Ratio"]

end_stage("1 -- Fetching & Preparing Data")

# ==============================================================================
# STAGE 2 -- BUILD SEQUENCES
# ==============================================================================
start_stage("2 -- Building Sequences")
log(f"Creating sliding windows of length {SEQ_LEN}...")

X_raw  = df[FEATURES].values.astype(np.float32)
y_raw  = df["Target"].values.astype(np.float32)

X_min  = X_raw.min(axis=0)
X_max  = X_raw.max(axis=0)
X_norm = (X_raw - X_min) / (X_max - X_min + 1e-9)

X_seq, y_seq = [], []
total_seq = len(X_norm) - SEQ_LEN
for i in range(total_seq):
    X_seq.append(X_norm[i:i+SEQ_LEN])
    y_seq.append(y_raw[i+SEQ_LEN])
    if (i+1) % 100 == 0 or (i+1) == total_seq:
        progress_bar(i+1, total_seq)

print()
X_seq = np.array(X_seq, dtype=np.float32)
y_seq = np.array(y_seq, dtype=np.float32)

n_total = len(X_seq)
n_train = int(n_total * 0.70)
n_val   = int(n_total * 0.15)

X_train, y_train = X_seq[:n_train],              y_seq[:n_train]
X_val,   y_val   = X_seq[n_train:n_train+n_val], y_seq[n_train:n_train+n_val]
X_test,  y_test  = X_seq[n_train+n_val:],        y_seq[n_train+n_val:]

log(f"Train: {len(X_train)} | Val: {len(X_val)} | Test: {len(X_test)}")
end_stage("2 -- Building Sequences")

# ==============================================================================
# STAGE 3 -- FUZZY ACTIVATION FUNCTIONS
# ==============================================================================
start_stage("3 -- Defining Fuzzy Activation Functions")

def gaussian_fuzzy(x, center=0.5, sigma=0.3):
    """Gaussian membership function -- neurons fire by degree of membership."""
    return np.exp(-((x - center) ** 2) / (2 * sigma ** 2))

def gaussian_fuzzy_deriv(x, center=0.5, sigma=0.3):
    """Derivative of Gaussian fuzzy activation for backprop."""
    g = gaussian_fuzzy(x, center, sigma)
    return g * (-(x - center) / (sigma ** 2))

def sigmoid(x):
    return 1 / (1 + np.exp(-np.clip(x, -500, 500)))

log("Fuzzy activation: Gaussian membership function")
log("Output activation: Sigmoid (binary classification)")
log("Input -> FuzzyLayer1(64) -> FuzzyLayer2(32) -> Sigmoid(1)", indent=3)

end_stage("3 -- Defining Fuzzy Activation Functions")

# ==============================================================================
# STAGE 4 -- BUILD NEURAL NETWORK (NumPy from scratch)
# ==============================================================================
start_stage("4 -- Building Fuzzy Neural Network")

np.random.seed(42)

INPUT_SIZE  = SEQ_LEN * len(FEATURES)
HIDDEN1     = 64
HIDDEN2     = 32
OUTPUT_SIZE = 1
LEARN_RATE  = 0.005
EPOCHS      = 60
BATCH_SIZE  = 32

FUZZY_CENTER1 = 0.5
FUZZY_SIGMA1  = 0.4
FUZZY_CENTER2 = 0.5
FUZZY_SIGMA2  = 0.3

def xavier(fan_in, fan_out):
    limit = np.sqrt(6 / (fan_in + fan_out))
    return np.random.uniform(-limit, limit, (fan_in, fan_out)).astype(np.float32)

W1 = xavier(INPUT_SIZE, HIDDEN1)
b1 = np.zeros((1, HIDDEN1),      dtype=np.float32)
W2 = xavier(HIDDEN1, HIDDEN2)
b2 = np.zeros((1, HIDDEN2),      dtype=np.float32)
W3 = xavier(HIDDEN2, OUTPUT_SIZE)
b3 = np.zeros((1, OUTPUT_SIZE),  dtype=np.float32)

total_params = (INPUT_SIZE*HIDDEN1 + HIDDEN1 +
                HIDDEN1*HIDDEN2   + HIDDEN2 +
                HIDDEN2*OUTPUT_SIZE + OUTPUT_SIZE)

log(f"Input size:    {INPUT_SIZE} ({SEQ_LEN} days x {len(FEATURES)} features)")
log(f"Hidden layer1: {HIDDEN1} neurons  [Gaussian Fuzzy]")
log(f"Hidden layer2: {HIDDEN2} neurons  [Gaussian Fuzzy]")
log(f"Output:        {OUTPUT_SIZE} neuron   [Sigmoid]")
log(f"Total params:  {total_params:,}")
log(f"Epochs: {EPOCHS}  |  Batch: {BATCH_SIZE}  |  LR: {LEARN_RATE}")

end_stage("4 -- Building Fuzzy Neural Network")

# ==============================================================================
# STAGE 5 -- TRAINING
# ==============================================================================
start_stage("5 -- Training")

def forward(X):
    Z1 = X @ W1 + b1
    A1 = gaussian_fuzzy(Z1, FUZZY_CENTER1, FUZZY_SIGMA1)
    Z2 = A1 @ W2 + b2
    A2 = gaussian_fuzzy(Z2, FUZZY_CENTER2, FUZZY_SIGMA2)
    Z3 = A2 @ W3 + b3
    A3 = sigmoid(Z3)
    return A3, (X, Z1, A1, Z2, A2, Z3, A3)

def backward(cache, y_true):
    X, Z1, A1, Z2, A2, Z3, A3 = cache
    m = y_true.shape[0]

    dZ3 = A3 - y_true
    dW3 = (A2.T @ dZ3) / m
    db3 = dZ3.mean(axis=0, keepdims=True)

    dA2 = dZ3 @ W3.T
    dZ2 = dA2 * gaussian_fuzzy_deriv(Z2, FUZZY_CENTER2, FUZZY_SIGMA2)
    dW2 = (A1.T @ dZ2) / m
    db2 = dZ2.mean(axis=0, keepdims=True)

    dA1 = dZ2 @ W2.T
    dZ1 = dA1 * gaussian_fuzzy_deriv(Z1, FUZZY_CENTER1, FUZZY_SIGMA1)
    dW1 = (X.T @ dZ1) / m
    db1 = dZ1.mean(axis=0, keepdims=True)

    return dW1, db1, dW2, db2, dW3, db3

def binary_cross_entropy(y_pred, y_true):
    y_pred = np.clip(y_pred, 1e-9, 1 - 1e-9)
    return -np.mean(y_true * np.log(y_pred) + (1 - y_true) * np.log(1 - y_pred))

def accuracy(y_pred, y_true):
    return np.mean((y_pred >= 0.5).astype(float) == y_true)

X_train_flat = X_train.reshape(len(X_train), -1)
X_val_flat   = X_val.reshape(len(X_val),     -1)
X_test_flat  = X_test.reshape(len(X_test),   -1)

y_train_col  = y_train.reshape(-1, 1)
y_val_col    = y_val.reshape(-1, 1)
y_test_col   = y_test.reshape(-1, 1)

train_losses, val_losses = [], []
train_accs,   val_accs   = [], []
epoch_times              = []

log(f"Starting training on {len(X_train_flat)} samples...")
print()

for epoch in range(1, EPOCHS + 1):
    ep_start = time.time()

    idx = np.random.permutation(len(X_train_flat))
    X_shuf, y_shuf = X_train_flat[idx], y_train_col[idx]

    batch_losses = []
    for start in range(0, len(X_shuf), BATCH_SIZE):
        Xb = X_shuf[start:start+BATCH_SIZE]
        yb = y_shuf[start:start+BATCH_SIZE]

        A3, cache = forward(Xb)
        loss = binary_cross_entropy(A3, yb)
        batch_losses.append(loss)

        dW1, db1_, dW2, db2_, dW3, db3_ = backward(cache, yb)
        W1 -= LEARN_RATE * dW1
        b1 -= LEARN_RATE * db1_
        W2 -= LEARN_RATE * dW2
        b2 -= LEARN_RATE * db2_
        W3 -= LEARN_RATE * dW3
        b3 -= LEARN_RATE * db3_

    ep_loss = np.mean(batch_losses)
    train_pred, _ = forward(X_train_flat)
    val_pred,   _ = forward(X_val_flat)

    tr_acc  = accuracy(train_pred, y_train_col)
    va_loss = binary_cross_entropy(val_pred, y_val_col)
    va_acc  = accuracy(val_pred, y_val_col)

    train_losses.append(ep_loss)
    val_losses.append(va_loss)
    train_accs.append(tr_acc)
    val_accs.append(va_acc)

    ep_time = time.time() - ep_start
    epoch_times.append(ep_time)
    eta           = np.mean(epoch_times) * (EPOCHS - epoch)
    total_elapsed = time.time() - overall_start

    print(f"  Epoch {epoch:3d}/{EPOCHS} | "
          f"Loss: {ep_loss:.4f} | Val Loss: {va_loss:.4f} | "
          f"Acc: {tr_acc*100:.1f}% | Val Acc: {va_acc*100:.1f}% | "
          f"ETA: {eta:.1f}s | Total: {total_elapsed:.1f}s")

end_stage("5 -- Training")

# ==============================================================================
# STAGE 6 -- EVALUATION
# ==============================================================================
start_stage("6 -- Evaluation on Test Set")

test_pred, _ = forward(X_test_flat)
test_acc     = accuracy(test_pred, y_test_col)
test_loss    = binary_cross_entropy(test_pred, y_test_col)

tp = np.sum((test_pred >= 0.5) & (y_test_col == 1))
tn = np.sum((test_pred <  0.5) & (y_test_col == 0))
fp = np.sum((test_pred >= 0.5) & (y_test_col == 0))
fn = np.sum((test_pred <  0.5) & (y_test_col == 1))

precision = tp / (tp + fp + 1e-9)
recall    = tp / (tp + fn + 1e-9)
f1        = 2 * precision * recall / (precision + recall + 1e-9)

log(f"Test Loss:     {test_loss:.4f}")
log(f"Test Accuracy: {test_acc*100:.2f}%")
log(f"Precision:     {precision:.4f}")
log(f"Recall:        {recall:.4f}")
log(f"F1 Score:      {f1:.4f}")
log(f"Confusion Matrix:")
log(f"  TP={tp}  FP={fp}", indent=3)
log(f"  FN={fn}  TN={tn}", indent=3)

end_stage("6 -- Evaluation on Test Set")

# ==============================================================================
# STAGE 7 -- PLOTTING
# ==============================================================================
start_stage("7 -- Generating Charts")

fig = plt.figure(figsize=(18, 12))
gs  = gridspec.GridSpec(2, 3, figure=fig, hspace=0.4, wspace=0.35)

ax1 = fig.add_subplot(gs[0, 0])
ax1.plot(train_losses, label="Train Loss", color="blue")
ax1.plot(val_losses,   label="Val Loss",   color="orange")
ax1.set_title("Loss Curves")
ax1.set_xlabel("Epoch")
ax1.set_ylabel("Binary Cross-Entropy")
ax1.legend()
ax1.grid(True, alpha=0.3)

ax2 = fig.add_subplot(gs[0, 1])
ax2.plot([a*100 for a in train_accs], label="Train Acc", color="green")
ax2.plot([a*100 for a in val_accs],   label="Val Acc",   color="red")
ax2.axhline(50, color="gray", linestyle="--", alpha=0.5, label="Baseline (50%)")
ax2.set_title("Accuracy Curves")
ax2.set_xlabel("Epoch")
ax2.set_ylabel("Accuracy (%)")
ax2.legend()
ax2.grid(True, alpha=0.3)

ax3 = fig.add_subplot(gs[0, 2])
x_range = np.linspace(-1, 2, 300)
ax3.plot(x_range, gaussian_fuzzy(x_range, 0.5, 0.4), label="Fuzzy Layer 1", color="purple",  linewidth=2)
ax3.plot(x_range, gaussian_fuzzy(x_range, 0.5, 0.3), label="Fuzzy Layer 2", color="magenta", linewidth=2, linestyle="--")
ax3.plot(x_range, sigmoid(x_range),                   label="Output Sigmoid", color="blue",   linewidth=2, linestyle=":")
ax3.set_title("Activation Functions")
ax3.set_xlabel("Input value (z)")
ax3.set_ylabel("Activation output")
ax3.legend(fontsize=8)
ax3.grid(True, alpha=0.3)

ax4 = fig.add_subplot(gs[1, :2])
test_dates  = df.index[n_train + n_val + SEQ_LEN:]
test_prices = df["Close"].values[n_train + n_val + SEQ_LEN:]
min_len     = min(len(test_dates), len(test_pred), len(test_prices))
test_dates  = test_dates[:min_len]
test_pred_a = test_pred[:min_len].flatten()
test_prices = test_prices[:min_len]

ax4.plot(test_dates, test_prices, color="black", linewidth=1.2, label="Price", zorder=1)
buy_mask  = test_pred_a >= 0.6
sell_mask = test_pred_a <= 0.4
ax4.scatter(test_dates[buy_mask],  test_prices[buy_mask],
            marker="^", color="green", s=60, label="BUY",  zorder=5)
ax4.scatter(test_dates[sell_mask], test_prices[sell_mask],
            marker="v", color="red",   s=60, label="SELL", zorder=5)
ax4.set_title(f"Fuzzy Neural Network Signals on {TICKER} (Test Set)")
ax4.set_xlabel("Date")
ax4.set_ylabel("Price ($)")
ax4.legend()
ax4.grid(True, alpha=0.3)

ax5 = fig.add_subplot(gs[1, 2])
ax5.hist(test_pred_a[test_pred_a >= 0.5], bins=20, color="green", alpha=0.6, label="Bullish")
ax5.hist(test_pred_a[test_pred_a <  0.5], bins=20, color="red",   alpha=0.6, label="Bearish")
ax5.axvline(0.5, color="black", linestyle="--")
ax5.set_title("Prediction Confidence Distribution")
ax5.set_xlabel("Confidence Score")
ax5.set_ylabel("Count")
ax5.legend()
ax5.grid(True, alpha=0.3)

fig.suptitle("Fuzzy Neural Network - Stock Prediction", fontsize=14, fontweight="bold")
plt.savefig("fuzzy_neural_net_results.png", dpi=150, bbox_inches="tight")
log("Chart saved as fuzzy_neural_net_results.png")
plt.show()

end_stage("7 -- Generating Charts")

total_time = time.time() - overall_start
print(f"""
{'='*60}
  FINAL SUMMARY
{'='*60}
  Ticker:           {TICKER}
  Training samples: {len(X_train):>6}
  Val samples:      {len(X_val):>6}
  Test samples:     {len(X_test):>6}

  Architecture:     Input({INPUT_SIZE}) -> Fuzzy({HIDDEN1}) -> Fuzzy({HIDDEN2}) -> Sigmoid(1)
  Total params:     {total_params:,}
  Fuzzy activation: Gaussian membership function

  Best Val Acc:     {max(val_accs)*100:.2f}%
  Test Accuracy:    {test_acc*100:.2f}%
  F1 Score:         {f1:.4f}

  Total runtime:    {total_time:.2f}s
{'='*60}
""")


np.savez(
  "fuzzy_model_weights.npz",
  W1=W1, b1=b1, W2=W2, b2=b2, W3=W3, b3=b3,
  X_min=X_min, X_max=X_max
)
print("Saved fuzzy_model_weights.npz")