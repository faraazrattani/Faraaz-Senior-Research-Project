import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StockQuote } from '@/types/stock';
import { cn } from '@/lib/utils';

interface StockCardProps {
  stock: StockQuote;
  onClick?: () => void;
}

export function StockCard({ stock, onClick }: StockCardProps) {
  const isPositive = stock.change >= 0;
  
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatChange = (change: number) => `${change >= 0 ? '+' : ''}${change.toFixed(2)}`;
  const formatPercent = (percent: number) => `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) return `${(volume / 1000000000).toFixed(1)}B`;
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toString();
  };

  return (
    <Card 
      className={cn(
        "p-4 hover:shadow-lg transition-all duration-200 cursor-pointer",
        "border-l-4",
        isPositive ? "border-l-success" : "border-l-danger"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg">{stock.symbol}</h3>
          <p className="text-sm text-muted-foreground truncate max-w-48">
            {stock.name}
          </p>
        </div>
        <div className={cn(
          "flex items-center",
          isPositive ? "text-success" : "text-danger"
        )}>
          {isPositive ? (
            <TrendingUp className="w-4 h-4 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 mr-1" />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{formatPrice(stock.price)}</span>
          <div className="text-right">
            <div className={cn(
              "text-sm font-medium",
              isPositive ? "text-success" : "text-danger"
            )}>
              {formatChange(stock.change)}
            </div>
            <div className={cn(
              "text-sm",
              isPositive ? "text-success" : "text-danger"
            )}>
              {formatPercent(stock.changePercent)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Volume: {formatVolume(stock.volume)}</span>
          {stock.sector && (
            <Badge variant="secondary" className="text-xs">
              {stock.sector}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}