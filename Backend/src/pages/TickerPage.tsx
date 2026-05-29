import { useState } from 'react';
import { ArrowLeft, Calendar, TrendingUp, Brain, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { OHLCChart } from '@/components/charts/OHLCChart';
import { mockStocks, mockPriceData, mockEarnings, mockPredictions } from '@/data/mockData';

interface TickerPageProps {
  symbol: string;
  onBack: () => void;
}

export function TickerPage({ symbol, onBack }: TickerPageProps) {
  const stock = mockStocks.find(s => s.symbol === symbol) || mockStocks[0];
  const priceData = mockPriceData[symbol] || mockPriceData['AAPL'];
  const earnings = mockEarnings[symbol] || [];
  const prediction = mockPredictions[symbol];

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatPercent = (percent: number) => `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold">{stock.symbol}</h1>
                <p className="text-muted-foreground">{stock.name}</p>
              </div>
              {stock.sector && (
                <Badge variant="secondary">{stock.sector}</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Price Info */}
        <Card className="p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-sm text-muted-foreground mb-1">Current Price</h3>
              <p className="text-2xl font-bold">{formatPrice(stock.price)}</p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground mb-1">Change</h3>
              <p className={`text-lg font-semibold ${stock.change >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatPrice(stock.change)} ({formatPercent(stock.changePercent)})
              </p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground mb-1">Volume</h3>
              <p className="text-lg font-semibold">{(stock.volume / 1000000).toFixed(1)}M</p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground mb-1">Market Cap</h3>
              <p className="text-lg font-semibold">
                {stock.marketCap ? `$${(stock.marketCap / 1000000000).toFixed(1)}B` : 'N/A'}
              </p>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="indicators" className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Indicators
            </TabsTrigger>
            <TabsTrigger value="earnings" className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Earnings
            </TabsTrigger>
            <TabsTrigger value="model" className="flex items-center">
              <Brain className="w-4 h-4 mr-2" />
              Model
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OHLCChart data={priceData} symbol={symbol} />
          </TabsContent>

          <TabsContent value="indicators">
            <div className="space-y-6">
              <OHLCChart data={priceData} symbol={symbol} showVolume={false} />
              
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">RSI (14)</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current: 58.2</span>
                      <span className="text-muted-foreground">Neutral</span>
                    </div>
                    <Progress value={58.2} className="h-2" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">MACD</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>MACD:</span>
                      <span className="text-success">+1.23</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Signal:</span>
                      <span>1.10</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Histogram:</span>
                      <span className="text-success">+0.13</span>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Moving Averages</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>SMA 20:</span>
                      <span>{formatPrice(stock.price * 0.98)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SMA 50:</span>
                      <span>{formatPrice(stock.price * 0.95)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SMA 200:</span>
                      <span>{formatPrice(stock.price * 0.92)}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="earnings">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Earnings History</h3>
                {earnings.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report Date</TableHead>
                        <TableHead>EPS Actual</TableHead>
                        <TableHead>EPS Estimate</TableHead>
                        <TableHead>Surprise</TableHead>
                        <TableHead>Surprise %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {earnings.map((earning) => (
                        <TableRow key={earning.id}>
                          <TableCell>{new Date(earning.reportDate).toLocaleDateString()}</TableCell>
                          <TableCell>${earning.epsActual?.toFixed(2) || 'N/A'}</TableCell>
                          <TableCell>${earning.epsEstimate?.toFixed(2) || 'N/A'}</TableCell>
                          <TableCell>
                            {earning.surprise && (
                              <span className={earning.surprise >= 0 ? 'text-success' : 'text-danger'}>
                                ${earning.surprise.toFixed(2)}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {earning.surprisePercent && (
                              <span className={earning.surprisePercent >= 0 ? 'text-success' : 'text-danger'}>
                                {formatPercent(earning.surprisePercent)}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No earnings data available for {symbol}
                  </p>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="model">
            <div className="space-y-6">
              {prediction ? (
                <>
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Next Earnings Window Prediction</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className={`text-3xl font-bold mb-2 ${
                          prediction.prediction === 'UP' ? 'text-success' : 'text-danger'
                        }`}>
                          {prediction.prediction}
                        </div>
                        <p className="text-sm text-muted-foreground">Predicted Direction</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-2">
                          {(prediction.directionProb * 100).toFixed(1)}%
                        </div>
                        <p className="text-sm text-muted-foreground">Probability</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-2">
                          {(prediction.confidence * 100).toFixed(1)}%
                        </div>
                        <p className="text-sm text-muted-foreground">Confidence</p>
                      </div>
                    </div>
                    {prediction.nextEarningsDate && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm">
                          <strong>Next Earnings:</strong> {new Date(prediction.nextEarningsDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Feature Importance</h3>
                    <div className="space-y-4">
                      {prediction.features.map((feature, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{feature.name}</span>
                            <span className="text-muted-foreground">
                              {(feature.importance * 100).toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={feature.importance * 100} className="h-2" />
                          <div className="text-xs text-muted-foreground">
                            Value: {feature.value.toFixed(3)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </>
              ) : (
                <Card className="p-6">
                  <p className="text-muted-foreground text-center py-8">
                    No prediction data available for {symbol}
                  </p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}