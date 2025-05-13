import React from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentTool } from "@shared/schema";

interface ToolCardProps {
  tool: AgentTool;
  onDelete: (id: number) => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onDelete }) => {
  const statusColor = {
    'Active': 'bg-green-100 text-green-800',
    'Inactive': 'bg-gray-100 text-gray-800',
    'Draft': 'bg-yellow-100 text-yellow-800',
    'Deprecated': 'bg-red-100 text-red-800'
  };

  const typeIcons = {
    'API': '🌐',
    'Function': '⚙️',
    'Service': '🔌',
    'Integration': '🔄',
    'Custom': '🛠️'
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl">{typeIcons[tool.type as keyof typeof typeIcons] || '🛠️'}</span>
              <CardTitle className="text-lg">{tool.name}</CardTitle>
            </div>
            <CardDescription className="mt-1 text-sm text-gray-500">
              {tool.version} • {tool.authType}
            </CardDescription>
          </div>
          <Badge className={cn("ml-auto", statusColor[tool.status as keyof typeof statusColor])}>
            {tool.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 line-clamp-2">{tool.description}</p>
        {tool.endpoint && (
          <div className="mt-3 text-xs text-gray-500 truncate">
            <span className="font-medium">Endpoint:</span> {tool.endpoint}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/tools/${tool.id}`}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(tool.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/tools/${tool.id}/test`}>
            <ArrowUpRight className="h-4 w-4 mr-1" />
            Test
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ToolCard;