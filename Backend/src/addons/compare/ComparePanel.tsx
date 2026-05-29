import { useState } from "react";

/**
 * Minimal compare panel that collects up to 3 tickers and emits a custom event.
 * Your existing pages can listen for this and render a chart overlay without changing base code.
 * (Or replace the event with a direct navigate call if you have a compare page.)
 */
export function ComparePanel() {
  const [input, setInput] = useState("");
  const [symbols, setSymbols] = useState<string[]>([]);

  const add = () => {
    const sym = input.trim().toUpperCase();
    if (!sym) return;
    if (symbols.length >= 3) return;
    if (!symbols.includes(sym)) setSymbols((s) => [...s, sym]);
    setInput("");
  };

  const remove = (sym: string) => {
    setSymbols((s) => s.filter((x) => x !== sym));
  };

  const broadcast = () => {
    window.dispatchEvent(new CustomEvent("ep:compare:update", { detail: { symbols } }));
    // You can hook this event in your ticker/backtest page to overlay the chart
    // Example:
    // useEffect(() => {
    //   const h = (e: any) => setOverlaySymbols(e.detail.symbols);
    //   window.addEventListener("ep:compare:update", h);
    //   return () => window.removeEventListener("ep:compare:update", h);
    // }, []);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add ticker (max 3)"
          className="w-full border rounded px-3 py-2"
        />
        <button onClick={add} className="border rounded px-3 py-2">Add</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {symbols.map((s) => (
          <span key={s} className="inline-flex items-center gap-2 border rounded px-2 py-1 text-sm">
            {s}
            <button onClick={() => remove(s)} className="underline text-xs">x</button>
          </span>
        ))}
        {symbols.length === 0 && <span className="text-sm text-muted-foreground">No symbols selected.</span>}
      </div>

      <div className="flex gap-2">
        <button onClick={broadcast} className="border rounded px-3 py-2">Plot / Update</button>
        <button onClick={() => setSymbols([])} className="border rounded px-3 py-2">Clear</button>
      </div>

      <p className="text-xs text-muted-foreground">
        Tip: listen for <code>ep:compare:update</code> in your chart component to overlay these symbols.
      </p>
    </div>
  );
}
