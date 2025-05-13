import React from 'react';
import { 
  Database, 
  FileText, 
  Calculator 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const ActionHistory: React.FC = () => {
  const historyItems = [
    {
      id: 'action1',
      title: 'Customer Query Results',
      icon: <Database className="h-4 w-4 text-neutrinos-blue" />,
      time: '2 min ago'
    },
    {
      id: 'action2',
      title: 'Risk Assessment',
      icon: <Calculator className="h-4 w-4 text-purple-600" />,
      time: '4 min ago'
    },
    {
      id: 'action3',
      title: 'Medical Records Analysis',
      icon: <FileText className="h-4 w-4 text-green-600" />,
      time: '10 min ago'
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b">
        <h3 className="font-medium text-gray-900">Action History</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {historyItems.map((item) => (
            <Card key={item.id} className="bg-white border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
              <CardContent className="p-3">
                <div className="flex items-center">
                  <div className="mr-3">{item.icon}</div>
                  <div>
                    <h4 className="text-sm font-medium">{item.title}</h4>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ActionHistory;