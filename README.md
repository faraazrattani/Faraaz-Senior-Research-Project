# Senior Research Project – Fuzzy Activation Stock Predictor

## Overview

This project predicts short-term stock price direction using machine learning models enhanced with fuzzy activation functions. The system extracts technical indicators, company fundamentals, and macroeconomic data, then trains neural networks to predict whether a stock will move up or down over the next 3 trading days.

The project compares a traditional ReLU-based neural network against a fuzzy-activation model to determine whether fuzzy logic can improve prediction performance in uncertain financial markets.

---

## Features

- Downloads historical stock data from Yahoo Finance
- Collects macroeconomic indicators from FRED
- Calculates technical indicators such as:
  - MACD
  - RSI
  - Moving Averages
- Incorporates company fundamentals:
  - P/E Ratio
  - Earnings Growth
  - Debt-to-Equity Ratio
- Creates 20-day rolling windows of stock data
- Predicts stock direction 3 trading days into the future
- Compares ReLU and Fuzzy-Activation neural networks
- Includes backtesting framework for model evaluation

---

## Project Structure
Senior-Research-Project-stock-predictor/
│
├── main.py # Main training and evaluation pipeline
├── feature_extraction.py # Data collection and feature engineering
├── fuzzy_activation.py # Fuzzy activation model
├── relu.py # ReLU baseline model
├── backtesting.py # Backtesting framework
├── stocks.txt # List of stock tickers
│
└── data/
└── processed/
└── dataset.npz


---

## Required Packages

Install the following Python packages before running the project:

```bash
pip install numpy pandas yfinance scikit-learn tensorflow tqdm pandas-datareader

How to Run
1. Clone the Repository
git clone https://github.com/faraazrattani/Senior-Research-Project.git
cd Senior-Research-Project
2. Configure Stock Tickers

Edit stocks.txt and place one ticker symbol per line:

AAPL
MSFT
NVDA
AMZN
TSLA
3. Generate Features and Dataset
python main.py --refresh-features

This will:

Download stock data from Yahoo Finance
Download macroeconomic data from FRED
Calculate all features
Save the processed dataset
4. Train and Evaluate Models
python main.py

The program will:

Load the processed dataset
Train both models
Run backtesting
Output performance metrics
Dataset Information

The model uses:

Technical Indicators
MACD
RSI
50-Day Moving Average
200-Day Moving Average
Fundamental Features
P/E Ratio (sector-adjusted)
Earnings Growth
Debt-to-Equity Ratio
Macroeconomic Features
Federal Funds Rate
Inflation Rate
Unemployment Rate
GDP Growth

Prediction Setup
Lookback Window: 20 trading days
Prediction Horizon: 3 trading days
Target: Stock direction (up or down)


Important Notes
An internet connection is required to download financial and economic data.
stocks.txt must exist and contain valid ticker symbols.
Feature generation can take several minutes depending on the number of stocks.
Generated datasets are stored as .npz files.
If the dataset already exists, the program will load it unless --refresh-features is specified.
Some FRED data requires the pandas-datareader package.
Ensure all file paths remain unchanged unless corresponding code is updated.
Research Goal

The purpose of this project is to investigate whether fuzzy activation functions can improve stock market prediction accuracy compared to traditional neural network activations by better handling uncertainty and noisy financial data.


This is suitable for a GitHub README and covers all the items your teacher requested.
