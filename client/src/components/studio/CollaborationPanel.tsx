import React from 'react';
import { Users, User, UserRound, PlusCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  CollaborationUser, 
  CollaborationChange,
  useCollaboration 
} from '@/hooks/use-collaboration';

interface CollaborationPanelProps {
  agentId: string;
  userName?: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  agentId,
  userName = 'User',
  isExpanded,
  onToggleExpand
}) => {
  const {
    isConnected,
    isLoading,
    users,
    changes,
    error
  } = useCollaboration({
    agentId,
    userName
  });

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    }).format(timestamp);
  };

  const getComponentTypeLabel = (type: string) => {
    switch(type) {
      case 'component_update':
        return 'Updated';
      case 'component_create':
        return 'Created';
      case 'component_delete':
        return 'Deleted';
      case 'agent_update':
        return 'Agent Updated';
      default:
        return 'Modified';
    }
  };

  if (!isExpanded) {
    return (
      <div className="fixed right-4 top-20 z-10">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant="secondary"
                className="h-10 w-10 rounded-full shadow-md"
                onClick={onToggleExpand}
              >
                <Users className="h-5 w-5" />
                {users.length > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-neutrinos-blue text-white"
                  >
                    {users.length}
                  </Badge>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Show Collaboration Panel</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="fixed right-4 top-20 z-10 w-72 bg-white border rounded-md shadow-lg flex flex-col max-h-[calc(100vh-160px)]">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center">
          <Users className="h-4 w-4 text-neutrinos-blue mr-2" />
          <h3 className="font-medium text-sm">Collaboration</h3>
        </div>
        {isConnected ? (
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
            Connected
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
            {isLoading ? 'Connecting...' : 'Disconnected'}
          </Badge>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="px-4 py-2 border-b bg-gray-50">
          <h4 className="text-xs font-medium text-gray-500 uppercase">Active Users ({users.length + 1})</h4>
        </div>
        
        <ScrollArea className="p-2 max-h-28">
          <div className="space-y-2">
            <div className="flex items-center p-2 rounded-md bg-gray-50">
              <div className="h-6 w-6 rounded-full bg-neutrinos-blue text-white flex items-center justify-center">
                <UserRound className="h-3 w-3" />
              </div>
              <div className="ml-2">
                <p className="text-xs font-medium">{userName} (You)</p>
              </div>
            </div>
            
            {users.map(user => (
              <div key={user.userId} className="flex items-center p-2 rounded-md hover:bg-gray-50">
                <div 
                  className="h-6 w-6 rounded-full text-white flex items-center justify-center" 
                  style={{ backgroundColor: user.color }}
                >
                  <User className="h-3 w-3" />
                </div>
                <div className="ml-2">
                  <p className="text-xs font-medium">{user.username}</p>
                </div>
              </div>
            ))}
            
            <Button 
              variant="ghost" 
              className="w-full h-8 text-xs"
              onClick={() => {
                // TODO: Implement invite functionality
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard! Share with collaborators.');
              }}
            >
              <PlusCircle className="h-3 w-3 mr-1" />
              Invite Collaborator
            </Button>
          </div>
        </ScrollArea>
        
        <Separator />
        
        <div className="px-4 py-2 border-b bg-gray-50">
          <h4 className="text-xs font-medium text-gray-500 uppercase">Recent Activities</h4>
        </div>
        
        <ScrollArea className="p-2 flex-1">
          {changes.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-xs text-gray-500">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {changes.slice(-10).reverse().map(change => {
                const user = users.find(u => u.userId === change.userId);
                
                return (
                  <div key={change.id} className="text-xs space-y-1">
                    <div className="flex items-center">
                      <div 
                        className="h-5 w-5 rounded-full text-white flex items-center justify-center mr-2" 
                        style={{ backgroundColor: user?.color || '#6B7280' }}
                      >
                        <User className="h-2.5 w-2.5" />
                      </div>
                      <span className="font-medium">{user?.username || 'Unknown user'}</span>
                      <span className="text-gray-400 mx-1">•</span>
                      <span className="text-gray-500">{getComponentTypeLabel(change.type)}</span>
                    </div>
                    
                    <div className="ml-7 flex items-center text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimestamp(change.timestamp)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default CollaborationPanel;