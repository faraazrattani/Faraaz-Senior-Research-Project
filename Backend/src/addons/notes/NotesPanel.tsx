import { useState } from "react";
import { useNotes } from "./useNotes";

export function NotesPanel() {
  const { notes, setNote } = useNotes();
  const [symbol, setSymbol] = useState("");
  const [text, setText] = useState("");

  const save = () => {
    setNote(symbol, text);
    setText("");
  };

  const entries = Object.entries(notes).sort(([a],[b]) => a.localeCompare(b));

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Ticker (e.g., NVDA)"
          className="w-40 border rounded px-3 py-2"
        />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a note…"
          className="flex-1 border rounded px-3 py-2"
        />
        <button onClick={save} className="border rounded px-3 py-2">Save</button>
      </div>

      <div className="rounded border divide-y">
        {entries.length === 0 && (
          <div className="p-3 text-sm text-muted-foreground">No notes yet.</div>
        )}
        {entries.map(([sym, content]) => (
          <div key={sym} className="p-3">
            <div className="text-sm font-semibold mb-1">{sym}</div>
            <div className="text-sm whitespace-pre-wrap">{content || <em>(empty)</em>}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
