export function ShortcutHelp() {
    return (
      <div className="space-y-2 text-sm">
        <p>Use these shortcuts anywhere on the site:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><kbd className="px-1 border rounded">?</kbd> — Open/close Add-ons</li>
          <li><kbd className="px-1 border rounded">W</kbd> — Watchlist tab</li>
          <li><kbd className="px-1 border rounded">C</kbd> — Compare tab</li>
        </ul>
        <p className="text-muted-foreground">We can add more on request (e.g., <kbd className="px-1 border rounded">N</kbd> for Notes).</p>
      </div>
    );
  }
  