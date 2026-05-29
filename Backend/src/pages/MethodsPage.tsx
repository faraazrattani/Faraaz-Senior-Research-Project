import { AlertTriangle, BookOpen, Database, Brain, Target, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function MethodsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Methodology & Research</h1>
            <p className="text-muted-foreground">
              Understanding our data sources, models, and limitations for educational research
            </p>
          </div>

          {/* Disclaimer */}
          <Alert className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Educational Use Only:</strong> This platform is designed for academic research and learning purposes. 
              All predictions and backtesting results are for educational use only and should not be considered financial advice.
            </AlertDescription>
          </Alert>

          <div className="space-y-8">
            {/* Data Sources */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Database className="w-6 h-6 text-primary mr-3" />
                <h2 className="text-xl font-semibold">Data Sources</h2>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-semibold mb-2">Price Data</h3>
                  <p className="text-muted-foreground">
                    Historical OHLCV (Open, High, Low, Close, Volume) data sourced from Yahoo Finance via the yfinance library.
                    Data includes daily price movements for major US stocks with adjustments for splits and dividends.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Earnings Information</h3>
                  <p className="text-muted-foreground">
                    Earnings announcement dates, EPS (Earnings Per Share) estimates, actual results, and surprise percentages
                    are collected from public financial data providers. Historical earnings data goes back approximately 5 years.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Technical Indicators</h3>
                  <p className="text-muted-foreground">
                    All technical indicators (SMA, RSI, MACD) are calculated using standard formulas:
                  </p>
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                    <li>Simple Moving Average (SMA): Average closing price over N periods</li>
                    <li>Relative Strength Index (RSI): Momentum oscillator (0-100) measuring speed of price changes</li>
                    <li>MACD: Moving Average Convergence Divergence with signal line and histogram</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Feature Engineering */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Target className="w-6 h-6 text-success mr-3" />
                <h2 className="text-xl font-semibold">Feature Engineering</h2>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-semibold mb-2">Target Variable</h3>
                  <p className="text-muted-foreground">
                    The prediction target is the direction of price movement during the "earnings window" - defined as 
                    the period from 1 day before earnings announcement to 2 days after. Binary classification: UP (positive return) 
                    or DOWN (negative return).
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Input Features</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li><strong>Price-based:</strong> Recent returns (1d, 5d, 10d, 20d), rolling volatility, price relative to moving averages</li>
                    <li><strong>Technical:</strong> RSI, MACD signal strength, volume ratios, momentum indicators</li>
                    <li><strong>Fundamental:</strong> Historical earnings surprise patterns, EPS growth trends</li>
                    <li><strong>Temporal:</strong> Days until earnings, quarter of year, market day of week</li>
                    <li><strong>Market:</strong> Sector performance, market correlation, VIX levels</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Model Architecture */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Brain className="w-6 h-6 text-warning mr-3" />
                <h2 className="text-xl font-semibold">Machine Learning Models</h2>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-semibold mb-2">Random Forest Classifier</h3>
                  <p className="text-muted-foreground">
                    Ensemble method using 100 decision trees with max depth of 10. Provides feature importance rankings
                    and handles non-linear relationships well. Good baseline model with interpretable results.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">XGBoost</h3>
                  <p className="text-muted-foreground">
                    Gradient boosting framework optimized for performance. Hyperparameters tuned via cross-validation
                    including learning rate (0.1), max depth (6), and regularization terms.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Training & Validation</h3>
                  <p className="text-muted-foreground">
                    Models trained on 3 years of historical data using time-series cross-validation to prevent lookahead bias.
                    Walk-forward validation ensures realistic performance estimates. Models retrained quarterly.
                  </p>
                </div>
              </div>
            </Card>

            {/* Backtesting Framework */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <BarChart3 className="w-6 h-6 text-purple-500 mr-3" />
                <h2 className="text-xl font-semibold">Backtesting Framework</h2>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-semibold mb-2">Strategy Implementation</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li><strong>Buy & Hold:</strong> Simple benchmark strategy purchasing and holding positions</li>
                    <li><strong>SMA Crossover:</strong> Buy when 50-day SMA crosses above 200-day SMA, sell on reverse</li>
                    <li><strong>Momentum:</strong> Monthly rebalancing based on 12-month minus 1-month returns</li>
                    <li><strong>Earnings ML:</strong> Enter positions 3 days before earnings based on model predictions</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Execution Simulation</h3>
                  <p className="text-muted-foreground">
                    Realistic trading costs included: 0.1% commission fees, 0.05% slippage per trade. 
                    No fractional shares, orders filled at next day's open price. Cash positions earn 0% interest.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Performance Metrics</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li><strong>Sharpe Ratio:</strong> Risk-adjusted returns assuming 2% risk-free rate</li>
                    <li><strong>Sortino Ratio:</strong> Similar to Sharpe but only penalizes downside volatility</li>
                    <li><strong>Maximum Drawdown:</strong> Largest peak-to-trough decline in portfolio value</li>
                    <li><strong>Win Rate:</strong> Percentage of profitable trades</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Limitations & Risks */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-danger mr-3" />
                <h2 className="text-xl font-semibold">Limitations & Risks</h2>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-semibold mb-2">Model Limitations</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Predictions are probabilistic and accuracy varies significantly across market conditions</li>
                    <li>Models trained on historical data may not generalize to future market regimes</li>
                    <li>Feature importance can change over time as market dynamics evolve</li>
                    <li>Survivorship bias: only includes companies that remained public throughout the study period</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Backtesting Assumptions</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Perfect information assumption: earnings dates known in advance</li>
                    <li>Liquidity assumption: can always execute trades at desired prices</li>
                    <li>No market impact: trades don't affect stock prices</li>
                    <li>Static transaction costs: fees and slippage don't vary by market conditions</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Risk Factors</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>High volatility around earnings can lead to significant losses</li>
                    <li>Model predictions may exhibit periods of poor performance</li>
                    <li>Transaction costs can significantly impact returns for frequent trading</li>
                    <li>Market microstructure effects not captured in daily data</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Academic Context */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <BookOpen className="w-6 h-6 text-blue-500 mr-3" />
                <h2 className="text-xl font-semibold">Academic Context</h2>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-semibold mb-2">Research Objectives</h3>
                  <p className="text-muted-foreground">
                    This project explores the application of machine learning to financial markets, specifically focusing
                    on earnings announcement periods. The goal is to understand whether short-term price movements can
                    be predicted using historical price patterns and fundamental data.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Learning Outcomes</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Understanding of time-series modeling challenges in finance</li>
                    <li>Experience with feature engineering for financial prediction</li>
                    <li>Knowledge of backtesting methodologies and their limitations</li>
                    <li>Appreciation for the complexity of financial markets and prediction</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Ethical Considerations</h3>
                  <p className="text-muted-foreground">
                    Financial prediction models should be developed and used responsibly. This platform emphasizes
                    transparency, limitation awareness, and educational use. Real-world financial decisions should
                    always involve professional advice and comprehensive risk assessment.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}