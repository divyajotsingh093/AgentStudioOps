import React from 'react';
import ActionCard from './ActionCard';
import { Separator } from '@/components/ui/separator';

export interface ReasoningAction {
  id: string;
  title: string;
  description: string;
  category: 'Reasoning' | 'Tool' | 'API' | 'Action';
  confidence?: number;
}

interface ReasoningFlowProps {
  actions: ReasoningAction[];
  onActionSelect: (action: ReasoningAction) => void;
}

const ReasoningFlow: React.FC<ReasoningFlowProps> = ({ actions = [], onActionSelect }) => {
  // Ensure actions is an array
  const actionsArray = Array.isArray(actions) ? actions : [];
  
  // Group actions by category
  const reasoningActions = actionsArray.filter(a => a?.category === 'Reasoning');
  const toolActions = actionsArray.filter(a => a?.category === 'Tool');
  const apiActions = actionsArray.filter(a => a?.category === 'API');
  const otherActions = actionsArray.filter(a => a?.category && !['Reasoning', 'Tool', 'API'].includes(a.category));

  return (
    <div className="space-y-4 py-2">
      {reasoningActions.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-gray-500 mb-2">REASONING</h3>
          {reasoningActions.map(action => (
            <ActionCard
              key={action.id}
              title={action.title}
              description={action.description}
              category={action.category}
              confidence={action.confidence}
              onSelect={() => onActionSelect(action)}
            />
          ))}
        </div>
      )}
      
      {(reasoningActions.length > 0 && (toolActions.length > 0 || apiActions.length > 0)) && (
        <Separator className="my-3" />
      )}
      
      {toolActions.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-gray-500 mb-2">AVAILABLE TOOLS</h3>
          {toolActions.map(action => (
            <ActionCard
              key={action.id}
              title={action.title}
              description={action.description}
              category={action.category}
              confidence={action.confidence}
              onSelect={() => onActionSelect(action)}
            />
          ))}
        </div>
      )}
      
      {apiActions.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-gray-500 mb-2">API ACTIONS</h3>
          {apiActions.map(action => (
            <ActionCard
              key={action.id}
              title={action.title}
              description={action.description}
              category={action.category}
              confidence={action.confidence}
              onSelect={() => onActionSelect(action)}
            />
          ))}
        </div>
      )}
      
      {otherActions.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-gray-500 mb-2">OTHER ACTIONS</h3>
          {otherActions.map(action => (
            <ActionCard
              key={action.id}
              title={action.title}
              description={action.description}
              category={action.category}
              confidence={action.confidence}
              onSelect={() => onActionSelect(action)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReasoningFlow;