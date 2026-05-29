import { useState, useEffect } from "react";
import { AddonsModal } from "./AddonsModal";

export function AddonsFab() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "?") setOpen(o => !o);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        aria-label="Open add-ons"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg px-4 py-3 border bg-background"
      >
        Add-ons
      </button>
      {open && <AddonsModal onClose={() => setOpen(false)} />}
    </>
  );
}
