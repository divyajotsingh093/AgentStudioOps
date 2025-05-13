import React from "react";
import { useResponsive } from "@/hooks/use-responsive";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LayoutGrid, List, ArrowUpDown, Search } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  width?: number;
  cell: (item: T) => React.ReactNode;
  sortable?: boolean;
  priority?: number; // Lower numbers have higher priority (shown on smaller screens)
  minWidth?: "xs" | "sm" | "md" | "lg" | "xl"; // Minimum screen width to show this column
}

interface ResponsiveDataGridProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  title?: string;
  description?: string;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  getRowClassName?: (item: T) => string;
  initialView?: "grid" | "table";
  hideViewSelector?: boolean;
  gridClassName?: string;
  gridCardContent: (item: T, isMobile: boolean) => React.ReactNode;
  filters?: React.ReactNode;
  pagination?: React.ReactNode;
  actionBar?: React.ReactNode;
  onSort?: (key: string, direction: "asc" | "desc") => void;
}

export function ResponsiveDataGrid<T>({
  data,
  columns,
  keyField,
  title,
  description,
  isLoading = false,
  emptyMessage = "No data available",
  onRowClick,
  getRowClassName,
  initialView = "grid",
  hideViewSelector = false,
  gridClassName,
  gridCardContent,
  filters,
  pagination,
  actionBar,
  onSort,
}: ResponsiveDataGridProps<T>) {
  const [view, setView] = React.useState<"grid" | "table">(initialView);
  const [sortField, setSortField] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");
  
  const { isMobile, isTablet, breakpoint } = useResponsive();
  
  // Determine which columns to show based on screen size
  const visibleColumns = React.useMemo(() => {
    return columns.filter(column => {
      if (!column.minWidth) return true;
      
      const minWidthMap: Record<string, number> = {
        xs: 0,
        sm: 1,
        md: 2,
        lg: 3,
        xl: 4
      };
      
      const breakpointMap: Record<string, number> = {
        xs: 0,
        sm: 1,
        md: 2,
        lg: 3,
        xl: 4,
        "2xl": 5
      };
      
      const currentBreakpointValue = breakpointMap[breakpoint] || 0;
      const minWidthValue = minWidthMap[column.minWidth] || 0;
      
      return currentBreakpointValue >= minWidthValue;
    });
  }, [columns, breakpoint]);
  
  // Handle sorting
  const handleSort = (key: string) => {
    if (sortField === key) {
      // Toggle direction if same field
      const newDirection = sortDirection === "asc" ? "desc" : "asc";
      setSortDirection(newDirection);
      onSort?.(key, newDirection);
    } else {
      // New sort field
      setSortField(key);
      setSortDirection("asc");
      onSort?.(key, "asc");
    }
  };
  
  const renderEmptyState = () => (
    <div className="py-8 text-center">
      <p className="text-gray-500">{emptyMessage}</p>
    </div>
  );
  
  const renderLoadingState = () => (
    <>
      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="py-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Skeleton className="h-9 w-20 ml-auto" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.map((column) => (
                    <TableHead key={column.key} style={{ width: column.width }}>
                      <Skeleton className="h-5 w-full" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {visibleColumns.map((column) => (
                      <TableCell key={column.key}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
  
  // Main render
  return (
    <div className="w-full">
      {/* Header and view controls */}
      {(title || description || !hideViewSelector) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          {(title || description) && (
            <div>
              {title && <h2 className="text-xl font-bold">{title}</h2>}
              {description && <p className="text-gray-600 text-sm">{description}</p>}
            </div>
          )}
          
          {!hideViewSelector && (
            <div className="flex items-center gap-1 ml-auto">
              <Button
                variant={view === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("grid")}
                className="px-2"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="sr-only">Grid view</span>
              </Button>
              <Button
                variant={view === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("table")}
                className="px-2"
              >
                <List className="h-4 w-4" />
                <span className="sr-only">Table view</span>
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Filters */}
      {filters && <div className="mb-4">{filters}</div>}
      
      {/* Action bar */}
      {actionBar && <div className="mb-4">{actionBar}</div>}
      
      {/* Content */}
      {isLoading ? (
        renderLoadingState()
      ) : data.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {view === "grid" ? (
            // Grid view
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${gridClassName || ""}`}>
              {data.map((item) => (
                <Card
                  key={String(item[keyField])}
                  className={`overflow-hidden hover:shadow-md transition-shadow ${
                    onRowClick ? "cursor-pointer" : ""
                  } ${getRowClassName ? getRowClassName(item) : ""}`}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                >
                  {gridCardContent(item, isMobile)}
                </Card>
              ))}
            </div>
          ) : (
            // Table view
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {visibleColumns.map((column) => (
                        <TableHead 
                          key={column.key} 
                          style={{ width: column.width }}
                          className={column.sortable ? "cursor-pointer select-none" : ""}
                          onClick={column.sortable ? () => handleSort(column.key) : undefined}
                        >
                          <div className="flex items-center space-x-1">
                            <span>{column.header}</span>
                            {column.sortable && sortField === column.key && (
                              <ArrowUpDown 
                                className={`h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""} transition-transform`} 
                              />
                            )}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item) => (
                      <TableRow
                        key={String(item[keyField])}
                        className={`${onRowClick ? "cursor-pointer" : ""} ${
                          getRowClassName ? getRowClassName(item) : ""
                        }`}
                        onClick={onRowClick ? () => onRowClick(item) : undefined}
                      >
                        {visibleColumns.map((column) => (
                          <TableCell key={column.key}>{column.cell(item)}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
      
      {/* Pagination */}
      {pagination && <div className="mt-4">{pagination}</div>}
    </div>
  );
}