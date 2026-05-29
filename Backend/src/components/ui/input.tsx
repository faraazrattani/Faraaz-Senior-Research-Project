import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        {...props}
        className={cn(
          // size
          "flex h-10 w-full rounded-md py-2",
          // use left/right separately so callers can override one side
          "pl-3 pr-3",
          // theme-aware colors
          "bg-background text-foreground",
          "border border-input placeholder:text-muted-foreground",
          // focus & disabled states
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // file input normalization
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className
        )}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
