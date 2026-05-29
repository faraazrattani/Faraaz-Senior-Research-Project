import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { mockPortfolio } from '@/data/mockData';

export function PortfolioPage() {
  const portfolio = mockPortfolio;

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
  const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Portfolio Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your paper trading portfolio performance and positions
          </p>
        </div>

        {/* Portfolio Summary */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(portfolio.totalValue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total P&L</p>
                <p className={`text-2xl font-bold ${portfolio.totalPnl >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatCurrency(portfolio.totalPnl)}
                </p>
              </div>
              {portfolio.totalPnl >= 0 ? (
                <TrendingUp className="w-8 h-8 text-success" />
              ) : (
                <TrendingDown className="w-8 h-8 text-danger" />
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Return %</p>
                <p className={`text-2xl font-bold ${portfolio.totalPnlPercent >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatPercent(portfolio.totalPnlPercent)}
                </p>
              </div>
              <Target className="w-8 h-8 text-warning" />
            </div>
          </Card>

          <Card className="p-6">
            <div>
              <p className="text-sm text-muted-foreground">Cash</p>
              <p className="text-2xl font-bold">{formatCurrency(portfolio.cash)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {((portfolio.cash / portfolio.totalValue) * 100).toFixed(1)}% of portfolio
              </p>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Equity Curve */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Portfolio Performance (3M)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={portfolio.equityCurve}>
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

          {/* Current Positions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Current Positions</h3>
            <div className="space-y-4">
              {portfolio.positions.map((position) => (
                <div key={position.symbol} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{position.symbol}</h4>
                    <p className="text-sm text-muted-foreground">
                      {position.shares} shares @ {formatCurrency(position.avgPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(position.marketValue)}</p>
                    <p className={`text-sm ${position.unrealizedPnl >= 0 ? 'text-success' : 'text-danger'}`}>
                      {formatCurrency(position.unrealizedPnl)} ({formatPercent(position.unrealizedPnlPercent)})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Trades */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Side</TableHead>
                <TableHead>Shares</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Commission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {portfolio.trades.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell>
                    {new Date(trade.timestamp).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">{trade.symbol}</TableCell>
                  <TableCell>
                    <Badge variant={trade.side === 'BUY' ? 'default' : 'secondary'}>
                      {trade.side}
                    </Badge>
                  </TableCell>
                  <TableCell>{trade.shares}</TableCell>
                  <TableCell>{formatCurrency(trade.price)}</TableCell>
                  <TableCell>{formatCurrency(trade.shares * trade.price)}</TableCell>
                  <TableCell>{formatCurrency(trade.commission)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}