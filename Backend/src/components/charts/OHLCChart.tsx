import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Bar } from 'recharts';
import { OHLCData, Indicator } from '@/types/stock';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface OHLCChartProps {
  data: (OHLCData & Indicator)[];
  symbol: string;
  showVolume?: boolean;
}

export function OHLCChart({ data, symbol, showVolume = true }: OHLCChartProps) {
  const [showIndicators, setShowIndicators] = useState({
    sma20: true,
    sma50: true,
    sma200: false,
    rsi: false,
  });

  const formatPrice = (value: number) => `$${value.toFixed(2)}`;
  const formatVolume = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p>Open: <span className="font-medium">{formatPrice(data.open)}</span></p>
            <p>High: <span className="font-medium text-success">{formatPrice(data.high)}</span></p>
            <p>Low: <span className="font-medium text-danger">{formatPrice(data.low)}</span></p>
            <p>Close: <span className="font-medium">{formatPrice(data.close)}</span></p>
            <p>Volume: <span className="font-medium">{formatVolume(data.volume)}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
        <h3 className="text-lg font-semibold">{symbol} Price Chart</h3>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="sma20" 
              checked={showIndicators.sma20}
              onCheckedChange={(checked) => 
                setShowIndicators(prev => ({ ...prev, sma20: checked as boolean }))
              }
            />
            <label htmlFor="sma20" className="text-sm">SMA 20</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="sma50" 
              checked={showIndicators.sma50}
              onCheckedChange={(checked) => 
                setShowIndicators(prev => ({ ...prev, sma50: checked as boolean }))
              }
            />
            <label htmlFor="sma50" className="text-sm">SMA 50</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="sma200" 
              checked={showIndicators.sma200}
              onCheckedChange={(checked) => 
                setShowIndicators(prev => ({ ...prev, sma200: checked as boolean }))
              }
            />
            <label htmlFor="sma200" className="text-sm">SMA 200</label>
          </div>
        </div>
      </div>

      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis 
              yAxisId="price"
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickFormatter={formatPrice}
            />
            {showVolume && (
              <YAxis 
                yAxisId="volume"
                orientation="right"
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickFormatter={formatVolume}
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            
            {/* Volume bars */}
            {showVolume && (
              <Bar 
                yAxisId="volume"
                dataKey="volume" 
                fill="hsl(var(--muted))" 
                opacity={0.3}
              />
            )}
            
            {/* Price line */}
            <Line 
              yAxisId="price"
              type="monotone" 
              dataKey="close" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={false}
            />
            
            {/* Moving averages */}
            {showIndicators.sma20 && (
              <Line 
                yAxisId="price"
                type="monotone" 
                dataKey="sma20" 
                stroke="hsl(var(--warning))" 
                strokeWidth={1}
                dot={false}
                strokeDasharray="5 5"
              />
            )}
            {showIndicators.sma50 && (
              <Line 
                yAxisId="price"
                type="monotone" 
                dataKey="sma50" 
                stroke="hsl(var(--success))" 
                strokeWidth={1}
                dot={false}
                strokeDasharray="3 3"
              />
            )}
            {showIndicators.sma200 && (
              <Line 
                yAxisId="price"
                type="monotone" 
                dataKey="sma200" 
                stroke="hsl(var(--danger))" 
                strokeWidth={1}
                dot={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}