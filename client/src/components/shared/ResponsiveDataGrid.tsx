import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveDataGridProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  className?: string;
  minWidth?: number;
  gap?: number;
}

export function ResponsiveDataGrid<T>({
  items,
  renderItem,
  className,
  minWidth = 250,
  gap = 4,
}: ResponsiveDataGridProps<T>) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 auto-rows-auto gap-4",
        `sm:grid-cols-auto-fit`,
        className
      )}
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
        gap: `${gap * 0.25}rem`,
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>{renderItem(item)}</React.Fragment>
      ))}
    </div>
  );
}