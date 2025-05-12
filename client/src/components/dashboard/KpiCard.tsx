import { cn } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface KpiCardProps {
  title: string;
  value: string;
  change: {
    value: string;
    trend: 'up' | 'down';
    positive?: boolean;
  };
  status: 'good' | 'fair' | 'poor';
  chartComponent?: React.ReactNode;
}

const KpiCard = ({ title, value, change, status, chartComponent }: KpiCardProps) => {
  const statusClasses = {
    good: "bg-lime-100 text-lime-700",
    fair: "bg-yellow-100 text-yellow-700",
    poor: "bg-rose-100 text-rose-700"
  };
  
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <span className={cn("text-xs px-2 py-0.5 rounded-full", statusClasses[status])}>
            {status === 'good' ? 'Good' : status === 'fair' ? 'Fair' : 'Poor'}
          </span>
        </div>
        <div className="flex items-end">
          <span className="text-3xl font-semibold">{value}</span>
          <span 
            className={cn(
              "ml-2 text-sm flex items-center", 
              change.positive ? "text-lime-600" : "text-rose-600"
            )}
          >
            {change.trend === 'up' ? 
              <ArrowUpIcon className="h-3 w-3 mr-0.5" /> : 
              <ArrowDownIcon className="h-3 w-3 mr-0.5" />} 
            {change.value}
          </span>
        </div>
        
        {/* Simplified chart placeholder - can be replaced with real chart component */}
        {chartComponent || (
          <div className={cn(
            "h-10 mt-2 rounded-md",
            status === 'good' ? "bg-gradient-to-r from-gray-200 to-lime-200" :
            status === 'fair' ? "bg-gradient-to-r from-gray-200 to-yellow-200" :
            "bg-gradient-to-r from-gray-200 to-rose-200"
          )}></div>
        )}
      </CardContent>
    </Card>
  );
};

export default KpiCard;
