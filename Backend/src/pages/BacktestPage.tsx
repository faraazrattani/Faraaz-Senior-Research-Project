import { useState } from 'react';
import { Play, Download, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { mockBacktestResult } from '@/data/mockData';
import { BacktestResult, BacktestParams } from '@/types/stock';

export function BacktestPage() {
  const [params, setParams] = useState<BacktestParams>({
    strategy: 'sma_crossover',
    symbols: ['AAPL', 'MSFT', 'NVDA'],
    startDate: '2022-01-01',
    endDate: '2024-01-01',
    initialCash: 100000,
    fees: 0.001,
    slippage: 0.0005
  });
  
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const strategies = [
    { value: 'buy_hold', label: 'Buy & Hold' },
    { value: 'sma_crossover', label: 'SMA Crossover (50/200)' },
    { value: 'momentum', label: 'Momentum (12-1)' },
    { value: 'earnings_long', label: 'Earnings Week Long' },
    { value: 'ml_random_forest', label: 'ML Random Forest' },
    { value: 'ml_xgboost', label: 'ML XGBoost' }
  ];

  const handleRun = async () => {
    setIsRunning(true);
    // Simulate running backtest
    setTimeout(() => {
      setResult(mockBacktestResult);
      setIsRunning(false);
    }, 3000);
  };

  const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;
  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Strategy Backtesting</h1>
          <p className="text-muted-foreground">
            Test trading strategies on historical data and analyze performance metrics
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Parameters Form */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Backtest Parameters</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="strategy">Strategy</Label>
                  <Select 
                    value={params.strategy} 
                    onValueChange={(value) => setParams(prev => ({ ...prev, strategy: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {strategies.map(strategy => (
                        <SelectItem key={strategy.value} value={strategy.value}>
                          {strategy.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="symbols">Symbols (comma-separated)</Label>
                  <Input
                    id="symbols"
                    value={params.symbols.join(', ')}
                    onChange={(e) => setParams(prev => ({ 
                      ...prev, 
                      symbols: e.target.value.split(',').map(s => s.trim().toUpperCase()) 
                    }))}
                    placeholder="AAPL, MSFT, NVDA"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={params.startDate}
                      onChange={(e) => setParams(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={params.endDate}
                      onChange={(e) => setParams(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="initialCash">Initial Cash</Label>
                  <Input
                    id="initialCash"
                    type="number"
                    value={params.initialCash}
                    onChange={(e) => setParams(prev => ({ ...prev, initialCash: Number(e.target.value) }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="fees">Fees (%)</Label>
                    <Input
                      id="fees"
                      type="number"
                      step="0.001"
                      value={params.fees}
                      onChange={(e) => setParams(prev => ({ ...prev, fees: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="slippage">Slippage (%)</Label>
                    <Input
                      id="slippage"
                      type="number"
                      step="0.0001"
                      value={params.slippage}
                      onChange={(e) => setParams(prev => ({ ...prev, slippage: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleRun} 
                  disabled={isRunning} 
                  className="w-full"
                  size="lg"
                >
                  {isRunning ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run Backtest
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {result ? (
              <div className="space-y-6">
                {/* Metrics Cards */}
                <div className="grid md:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Return</p>
                        <p className="text-2xl font-bold text-success">
                          {formatPercent(result.metrics.totalReturn)}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-success" />
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                      <p className="text-2xl font-bold">{result.metrics.sharpeRatio.toFixed(2)}</p>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Max Drawdown</p>
                      <p className="text-2xl font-bold text-danger">
                        {formatPercent(result.metrics.maxDrawdown)}
                      </p>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Win Rate</p>
                      <p className="text-2xl font-bold">{formatPercent(result.metrics.winRate)}</p>
                    </div>
                  </Card>
                </div>

                {/* Equity Curve */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Equity Curve</h3>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={result.equityCurve}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="date" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickFormatter={(value) => formatCurrency(value)}
                        />
                        <Tooltip 
                          formatter={(value: number) => [formatCurrency(value), 'Portfolio Value']}
                          labelFormatter={(label) => new Date(label).toLocaleDateString()}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Detailed Metrics */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Annualized Return:</span>
                        <span className="font-medium">{formatPercent(result.metrics.annualizedReturn)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sortino Ratio:</span>
                        <span className="font-medium">{result.metrics.sortinoRatio.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Trade:</span>
                        <span className="font-medium">{formatCurrency(result.metrics.avgTrade)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Exposure:</span>
                        <span className="font-medium">{formatPercent(result.metrics.exposure)}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total Trades:</span>
                        <span className="font-medium">{result.metrics.totalTrades}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Strategy:</span>
                        <Badge variant="secondary">
                          {strategies.find(s => s.value === result.params.strategy)?.label}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Symbols:</span>
                        <span className="font-medium">{result.params.symbols.join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Period:</span>
                        <span className="font-medium text-sm">
                          {result.params.startDate} to {result.params.endDate}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Recent Trades */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Side</TableHead>
                        <TableHead>Shares</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>P&L</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.trades.slice(-10).map((trade) => (
                        <TableRow key={trade.id}>
                          <TableCell>
                            {new Date(trade.timestamp).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{trade.symbol}</TableCell>
                          <TableCell>
                            <Badge variant={trade.side === 'BUY' ? 'default' : 'secondary'}>
                              {trade.side}
                            </Badge>
                          </TableCell>
                          <TableCell>{trade.shares}</TableCell>
                          <TableCell>{formatCurrency(trade.price)}</TableCell>
                          <TableCell>
                            {trade.pnl !== undefined && (
                              <span className={trade.pnl >= 0 ? 'text-success' : 'text-danger'}>
                                {formatCurrency(trade.pnl)}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            ) : (
              <Card className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Ready to Backtest</h3>
                  <p className="text-muted-foreground">
                    Configure your parameters and run a backtest to see how your strategy would have performed historically.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}