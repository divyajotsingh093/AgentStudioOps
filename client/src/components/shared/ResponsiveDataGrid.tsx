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
  // Add a safety check for items being undefined or null
  const safeItems = items || [];
  
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
      {safeItems.length === 0 ? (
        <div className="col-span-full py-8 text-center text-gray-500 dark:text-gray-400">
          No items to display
        </div>
      ) : (
        safeItems.map((item, index) => (
          <React.Fragment key={index}>{renderItem(item)}</React.Fragment>
        ))
      )}
    </div>
  );
}