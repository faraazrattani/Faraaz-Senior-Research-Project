import { StockQuote, OHLCData, Earnings, Indicator, Prediction, BacktestResult, Portfolio, FeatureImportance } from '@/types/stock';

// Generate realistic stock data
const generateOHLCData = (symbol: string, days: number = 252): (OHLCData & Indicator)[] => {
  const data: (OHLCData & Indicator)[] = [];
  let price = symbol === 'AAPL' ? 175 : symbol === 'MSFT' ? 380 : symbol === 'NVDA' ? 800 : 100;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Generate realistic price movement
    const change = (Math.random() - 0.5) * 0.04; // ±2% daily change
    const open = price;
    const high = price * (1 + Math.abs(change) + Math.random() * 0.01);
    const low = price * (1 - Math.abs(change) - Math.random() * 0.01);
    const close = price * (1 + change);
    const volume = Math.floor(Math.random() * 50000000 + 10000000);

    // Simple moving averages
    const sma20 = i >= 19 ? data.slice(i - 19, i + 1).reduce((sum, d) => sum + d.close, 0) / 20 : undefined;
    const sma50 = i >= 49 ? data.slice(i - 49, i + 1).reduce((sum, d) => sum + d.close, 0) / 50 : undefined;
    const sma200 = i >= 199 ? data.slice(i - 199, i + 1).reduce((sum, d) => sum + d.close, 0) / 200 : undefined;
    
    // RSI (simplified)
    const rsi = 30 + Math.random() * 40; // 30-70 range
    
    data.push({
      date: date.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      volume,
      sma20,
      sma50,
      sma200,
      rsi,
    });

    price = close;
  }

  return data;
};

export const mockStocks: StockQuote[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 175.23,
    change: 2.34,
    changePercent: 1.35,
    volume: 45623000,
    marketCap: 2750000000000,
    sector: 'Technology'
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 384.56,
    change: -1.23,
    changePercent: -0.32,
    volume: 23456000,
    marketCap: 2850000000000,
    sector: 'Technology'
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 825.43,
    change: 15.67,
    changePercent: 1.93,
    volume: 67890000,
    marketCap: 2030000000000,
    sector: 'Technology'
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 245.12,
    change: -8.45,
    changePercent: -3.33,
    volume: 89234000,
    marketCap: 780000000000,
    sector: 'Automotive'
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.67,
    change: 0.89,
    changePercent: 0.63,
    volume: 34567000,
    marketCap: 1800000000000,
    sector: 'Technology'
  }
];

export const mockPriceData = {
  'AAPL': generateOHLCData('AAPL'),
  'MSFT': generateOHLCData('MSFT'),
  'NVDA': generateOHLCData('NVDA'),
  'TSLA': generateOHLCData('TSLA'),
  'GOOGL': generateOHLCData('GOOGL'),
};

export const mockEarnings: Record<string, Earnings[]> = {
  'AAPL': [
    {
      id: '1',
      symbol: 'AAPL',
      reportDate: '2024-01-25',
      epsActual: 2.18,
      epsEstimate: 2.10,
      surprise: 0.08,
      surprisePercent: 3.81
    },
    {
      id: '2',
      symbol: 'AAPL',
      reportDate: '2023-10-26',
      epsActual: 1.46,
      epsEstimate: 1.39,
      surprise: 0.07,
      surprisePercent: 5.04
    },
    {
      id: '3',
      symbol: 'AAPL',
      reportDate: '2023-07-27',
      epsActual: 1.26,
      epsEstimate: 1.19,
      surprise: 0.07,
      surprisePercent: 5.88
    }
  ]
};

export const mockPredictions: Record<string, Prediction> = {
  'AAPL': {
    symbol: 'AAPL',
    asOfDate: '2024-01-15',
    directionProb: 0.73,
    confidence: 0.68,
    prediction: 'UP',
    nextEarningsDate: '2024-04-25',
    features: [
      { name: 'Recent Returns (5d)', importance: 0.24, value: 0.032 },
      { name: 'RSI (14d)', importance: 0.18, value: 0.58 },
      { name: 'Volume Ratio', importance: 0.15, value: 1.23 },
      { name: 'Earnings Surprise History', importance: 0.12, value: 0.045 },
      { name: 'Sector Momentum', importance: 0.11, value: 0.021 },
      { name: 'MACD Signal', importance: 0.09, value: 0.087 },
      { name: 'Volatility (20d)', importance: 0.07, value: 0.178 },
      { name: 'Market Correlation', importance: 0.04, value: 0.67 }
    ]
  }
};

export const mockBacktestResult: BacktestResult = {
  id: 'bt_001',
  params: {
    strategy: 'SMA Crossover',
    symbols: ['AAPL', 'MSFT', 'NVDA'],
    startDate: '2022-01-01',
    endDate: '2024-01-01',
    initialCash: 100000,
    fees: 0.001,
    slippage: 0.0005
  },
  metrics: {
    totalReturn: 0.342,
    annualizedReturn: 0.158,
    sharpeRatio: 1.23,
    sortinoRatio: 1.67,
    maxDrawdown: -0.124,
    winRate: 0.58,
    avgTrade: 234.56,
    exposure: 0.78,
    totalTrades: 47
  },
  equityCurve: generateEquityCurve(),
  trades: generateTrades(),
  status: 'DONE',
  startedAt: '2024-01-15T10:00:00Z',
  finishedAt: '2024-01-15T10:02:34Z'
};

function generateEquityCurve() {
  const data = [];
  let value = 100000;
  const startDate = new Date('2022-01-01');
  
  for (let i = 0; i < 500; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i * 1.5);
    
    // Generate realistic equity curve with some volatility
    const change = (Math.random() - 0.48) * 0.02; // Slight upward bias
    value *= (1 + change);
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value)
    });
  }
  
  return data;
}

function generateTrades() {
  const trades = [];
  const symbols = ['AAPL', 'MSFT', 'NVDA'];
  
  for (let i = 0; i < 47; i++) {
    const symbol = symbols[i % symbols.length];
    const side = i % 2 === 0 ? 'BUY' : 'SELL';
    const shares = Math.floor(Math.random() * 100 + 10);
    const price = Math.random() * 200 + 100;
    
    trades.push({
      id: `trade_${i}`,
      symbol,
      side: side as 'BUY' | 'SELL',
      shares,
      price,
      timestamp: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      commission: shares * price * 0.001,
      pnl: side === 'SELL' ? (Math.random() - 0.4) * 1000 : undefined
    });
  }
  
  return trades.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export const mockPortfolio: Portfolio = {
  id: 'portfolio_1',
  name: 'Demo Portfolio',
  cash: 25000,
  totalValue: 125000,
  totalPnl: 25000,
  totalPnlPercent: 25.0,
  positions: [
    {
      symbol: 'AAPL',
      shares: 100,
      avgPrice: 160.50,
      currentPrice: 175.23,
      marketValue: 17523,
      unrealizedPnl: 1473,
      unrealizedPnlPercent: 9.17
    },
    {
      symbol: 'MSFT',
      shares: 75,
      avgPrice: 370.00,
      currentPrice: 384.56,
      marketValue: 28842,
      unrealizedPnl: 1092,
      unrealizedPnlPercent: 3.93
    },
    {
      symbol: 'NVDA',
      shares: 50,
      avgPrice: 750.00,
      currentPrice: 825.43,
      marketValue: 41271.50,
      unrealizedPnl: 3771.50,
      unrealizedPnlPercent: 10.04
    }
  ],
  trades: generateTrades().slice(0, 20),
  equityCurve: generateEquityCurve().slice(-90) // Last 3 months
};