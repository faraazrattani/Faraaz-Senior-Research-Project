import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = Omit<React.ComponentProps<typeof Input>, "type"> & {
  wrapperClassName?: string;
};

export default function SearchField({
  className,
  wrapperClassName,
  placeholder = "Search tickers…",
  ...props
}: Props) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
      />
      <Input
        type="search"
        placeholder={placeholder}
        // reserve space for the icon; use ! to beat any inherited padding
        className={cn("h-12 !pl-12 pr-4 rounded-xl", className)}
        {...props}
      />
    </div>
  );
}
