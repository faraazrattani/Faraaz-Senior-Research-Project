import { useEffect, useState } from "react";
type Notes = Record<string, string>;
const KEY = "ep_notes_v1";

export function useNotes() {
  const [notes, setNotes] = useState<Notes>({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setNotes(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(notes));
  }, [notes]);

  const setNote = (symbol: string, text: string) => {
    const sym = symbol.trim().toUpperCase();
    if (!sym) return;
    setNotes((prev) => ({ ...prev, [sym]: text }));
  };

  return { notes, setNote };
}
