import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Search, ArrowUpRight } from 'lucide-react';

// Component types based on the screenshot
export type ComponentCategory = 'Context' | 'Tools' | 'Prompt' | 'Capability';

export interface AgentComponent {
  id: string;
  name: string;
  category: ComponentCategory;
  description: string;
  status?: 'Available' | 'Restricted' | 'Draft';
  type?: string;
  details?: Record<string, any>;
}

interface AgentComponentManagerProps {
  components: AgentComponent[];
  onEditComponent: (component: AgentComponent) => void;
  onAddComponent: (category: ComponentCategory) => void;
  onUseComponent: (component: AgentComponent) => void;
}

const AgentComponentManager: React.FC<AgentComponentManagerProps> = ({
  components,
  onEditComponent,
  onAddComponent,
  onUseComponent
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Get unique categories for filtering
  const categories = [...new Set(components.map(component => component.category))];
  
  // Filter components based on search and category
  const filteredComponents = components.filter(component => {
    const matchesSearch = 
      component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory ? component.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });

  // Group components by category
  const groupedComponents = filteredComponents.reduce((acc, component) => {
    if (!acc[component.category]) {
      acc[component.category] = [];
    }
    acc[component.category].push(component);
    return acc;
  }, {} as Record<string, AgentComponent[]>);

  // Function to render status badge
  const renderStatusBadge = (status?: string) => {
    if (!status) return null;
    
    switch(status) {
      case 'Available':
        return <Badge className="bg-blue-100 text-blue-700">Available</Badge>;
      case 'Restricted':
        return <Badge className="bg-orange-100 text-orange-700">Restricted</Badge>;
      case 'Draft':
        return <Badge className="bg-gray-100 text-gray-700">Draft</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-2">Agent Components</h2>
        <div className="flex flex-wrap items-center gap-2">
          {categories.map(category => (
            <Button 
              key={category}
              variant={selectedCategory === category ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
              className={selectedCategory === category ? "bg-neutrinos-blue hover:bg-neutrinos-blue/90" : ""}
            >
              {category}
            </Button>
          ))}
          <div className="flex-1 relative max-w-md ml-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search components..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-neutrinos-blue focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {Object.entries(groupedComponents).map(([category, categoryComponents]) => (
          <div key={category} className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-md font-semibold">{category}</h3>
              <Button 
                size="sm"
                variant="outline"
                className="gap-1 text-neutrinos-blue border-neutrinos-blue hover:bg-blue-50"
                onClick={() => onAddComponent(category as ComponentCategory)}
              >
                <Plus className="h-4 w-4" />
                Add {category}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-4">
              {categoryComponents.map(component => (
                <Card key={component.id} className="overflow-hidden border-l-4 border-l-neutrinos-blue transition-all hover:shadow-md">
                  <CardHeader className="p-3 md:p-4 pb-1 md:pb-2">
                    <div className="flex justify-between items-start flex-wrap">
                      <CardTitle className="text-md font-semibold">{component.name}</CardTitle>
                      <div className="flex items-center gap-1 md:gap-2 mt-1 md:mt-0">
                        {renderStatusBadge(component.status)}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 md:h-8 md:w-8 p-0" 
                          onClick={() => onEditComponent(component)}
                        >
                          <Edit className="h-3 w-3 md:h-4 md:w-4 text-gray-500" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="text-xs md:text-sm mt-1">
                      {component.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 md:p-4 pt-0 md:pt-0 pb-1 md:pb-2">
                    {component.details && (
                      <div className="text-xs text-gray-500 overflow-hidden">
                        {Object.entries(component.details).map(([key, value]) => (
                          <p key={key} className="truncate">
                            <span className="font-medium">{key}:</span> {value}
                          </p>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  {component.category === 'Capability' && (
                    <CardFooter className="p-3 md:p-4 pt-1 md:pt-2 flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-neutrinos-blue hover:text-neutrinos-blue/90 hover:bg-blue-50 text-xs md:text-sm"
                        onClick={() => onUseComponent(component)}
                      >
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        Use
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default AgentComponentManager;