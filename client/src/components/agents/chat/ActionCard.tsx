import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Server, DoorOpen, ArrowRight } from 'lucide-react';

interface ActionCardProps {
  title: string;
  description: string;
  category: string;
  confidence?: number;
  onSelect: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  category,
  confidence = 0,
  onSelect
}) => {
  const confidencePercent = Math.round(confidence * 100);
  
  // Icon based on category
  const getIcon = () => {
    switch(category.toLowerCase()) {
      case 'reasoning':
        return <Brain className="w-4 h-4 mr-1 text-purple-500" />;
      case 'tool':
        return <Zap className="w-4 h-4 mr-1 text-amber-500" />;
      case 'api':
        return <Server className="w-4 h-4 mr-1 text-blue-500" />;
      default:
        return <DoorOpen className="w-4 h-4 mr-1 text-gray-500" />;
    }
  };
  
  return (
    <Card className="mb-3 shadow-sm border-l-4 hover:shadow-md transition-shadow duration-200" 
          style={{borderLeftColor: category.toLowerCase() === 'reasoning' 
                                    ? '#9333ea' // purple-600
                                    : category.toLowerCase() === 'tool' 
                                      ? '#f59e0b' // amber-500
                                      : category.toLowerCase() === 'api' 
                                        ? '#3b82f6' // blue-500
                                        : '#94a3b8' // slate-400
          }}>
      <CardHeader className="p-3 pb-0">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-medium flex items-center">
            {getIcon()}
            {title}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {category}
            {confidence > 0 && ` · ${confidencePercent}%`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        <p className="text-sm text-gray-600">{description}</p>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-end">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs flex items-center text-neutrinos-blue hover:text-neutrinos-blue hover:bg-blue-50"
          onClick={onSelect}
        >
          Select <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ActionCard;