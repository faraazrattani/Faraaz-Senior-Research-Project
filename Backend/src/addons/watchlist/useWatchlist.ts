import { useCallback, useEffect, useMemo, useState } from "react";
const KEY = "ep_watchlist_v1";
type Watchlist = string[];

export function useWatchlist() {
  const [list, setList] = useState<Watchlist>([]);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) try { setList(JSON.parse(raw)); } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(list));
  }, [list]);

  const add = useCallback((t: string) => {
    const sym = t.trim().toUpperCase();
    if (!sym) return;
    setList(prev => (prev.includes(sym) ? prev : [...prev, sym]));
  }, []);

  const remove = useCallback((t: string) => {
    const sym = t.trim().toUpperCase();
    setList(prev => prev.filter(x => x !== sym));
  }, []);

  const clear = useCallback(() => setList([]), []);
  return useMemo(() => ({ list, add, remove, clear }), [list, add, remove, clear]);
}
