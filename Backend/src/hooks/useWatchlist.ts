import { useEffect, useState } from "react";


const STORAGE_KEY = "marketmind_watchlist";

export function useWatchlist() {
  const [tickers, setTickers] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickers));
  }, [tickers]);

  const addTicker = (ticker: string) => {
    const t = ticker.trim().toUpperCase();
    if (!t) return;
    setTickers((prev) => (prev.includes(t) ? prev : [...prev, t]));
  };

  const removeTicker = (ticker: string) => {
    setTickers((prev) => prev.filter((x) => x !== ticker));
  };

  return { tickers, addTicker, removeTicker };
}
