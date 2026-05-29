import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchField from "@/components/SearchField";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onSearch?: (query: string) => void;
  onNavigate?: (page: string) => void;
}

export function Header({ onSearch, onNavigate }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery.trim());
  };

  return (
    <header className={cn("sticky top-0 z-50 border-b border-border bg-card text-card-foreground")}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            MarketMind
          </h1>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 w-[28rem]">
          <SearchField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            placeholder="Search tickers…"
          />
          <Button type="submit">Search</Button>
        </form>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button
            variant="secondary"
            onClick={() => onNavigate?.("portfolio")}
            className="hidden sm:inline-flex"
          >
            Portfolio
          </Button>
        </div>
      </div>
    </header>
  );
}
