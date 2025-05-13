import React from "react";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MoreVertical, 
  ExternalLink, 
  Trash2, 
  Edit, 
  Play, 
  ArrowRightCircle,
  FileCode,
  Globe,
  Cog,
  Plug,
  Package,
  Key
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentTool } from "@shared/schema";

interface ToolCardProps {
  tool: AgentTool;
  onDelete: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onDelete }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "API":
        return <Globe className="h-4 w-4" />;
      case "Function":
        return <FileCode className="h-4 w-4" />;
      case "Service":
        return <Cog className="h-4 w-4" />;
      case "Integration":
        return <Plug className="h-4 w-4" />;
      case "Custom":
        return <Package className="h-4 w-4" />;
      default:
        return <FileCode className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-gray-100 text-gray-800";
      case "Draft":
        return "bg-blue-100 text-blue-800";
      case "Deprecated":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAuthIcon = (authType: string) => {
    switch (authType) {
      case "None":
        return null;
      case "ApiKey":
      case "OAuth":
      case "Basic":
      case "Custom":
        return <Key className="h-3 w-3 ml-1 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <Badge variant="outline" className="mr-2 font-normal">
              {getTypeIcon(tool.type)}
              <span className="ml-1">{tool.type}</span>
            </Badge>
            <Badge className={cn("font-normal", getStatusColor(tool.status))}>
              {tool.status}
            </Badge>
            {tool.authType !== "None" && (
              <span className="ml-2 flex items-center text-xs text-gray-500">
                {tool.authType}
                {getAuthIcon(tool.authType)}
              </span>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/tools/${tool.id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="text-xl mt-2">{tool.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {tool.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-xs text-gray-500 mt-2">
          <div className="flex justify-between items-center">
            <span>Version: {tool.version}</span>
            {tool.createdAt && (
              <span>
                {new Date(tool.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-between items-center border-t">
        <Link href={`/tools/${tool.id}`}>
          <Button variant="outline" size="sm" className="mr-2">
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </Link>
        <div className="flex">
          <Button variant="ghost" size="sm" className="text-primary">
            <Play className="h-4 w-4 mr-1" />
            Test
          </Button>
          <Button variant="ghost" size="sm" className="text-primary">
            <ArrowRightCircle className="h-4 w-4 mr-1" />
            Use
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ToolCard;