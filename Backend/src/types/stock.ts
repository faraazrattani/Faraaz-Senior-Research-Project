export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  sector?: string;
}

export interface OHLCData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Earnings {
  id: string;
  symbol: string;
  reportDate: string;
  epsActual?: number;
  epsEstimate?: number;
  surprise?: number;
  surprisePercent?: number;
}

export interface Indicator {
  date: string;
  sma20?: number;
  sma50?: number;
  sma200?: number;
  rsi?: number;
  macd?: number;
  macdSignal?: number;
  macdHistogram?: number;
}

export interface Prediction {
  symbol: string;
  asOfDate: string;
  directionProb: number;
  confidence: number;
  prediction: 'UP' | 'DOWN';
  features: FeatureImportance[];
  nextEarningsDate?: string;
}

export interface FeatureImportance {
  name: string;
  importance: number;
  value: number;
}

export interface BacktestParams {
  strategy: string;
  symbols: string[];
  startDate: string;
  endDate: string;
  initialCash: number;
  fees: number;
  slippage: number;
}

export interface BacktestMetrics {
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  winRate: number;
  avgTrade: number;
  exposure: number;
  totalTrades: number;
}

export interface BacktestResult {
  id: string;
  params: BacktestParams;
  metrics: BacktestMetrics;
  equityCurve: { date: string; value: number }[];
  trades: Trade[];
  status: 'PENDING' | 'RUNNING' | 'DONE' | 'ERROR';
  startedAt: string;
  finishedAt?: string;
}

export interface Trade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  shares: number;
  price: number;
  timestamp: string;
  pnl?: number;
  commission: number;
}

export interface Position {
  symbol: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
}

export interface Portfolio {
  id: string;
  name: string;
  cash: number;
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  positions: Position[];
  trades: Trade[];
  equityCurve: { date: string; value: number }[];
}