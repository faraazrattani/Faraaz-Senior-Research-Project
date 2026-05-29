import React from "react";
import { useTheme } from "@/theme/ThemeProvider";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const order: Array<"light" | "dark" | "system"> = ["light", "dark", "system"];

  const next = () => {
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % order.length]);
  };

  const label = theme === "system" ? "Auto" : theme === "dark" ? "Dark" : "Light";

  return (
    <button
      onClick={next}
      className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 bg-card text-card-foreground"
      title={`Theme: ${label} (click to change)`}
    >
      <span className="text-sm">Theme: {label}</span>
    </button>
  );
}
