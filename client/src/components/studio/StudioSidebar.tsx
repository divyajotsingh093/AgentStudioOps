import { Edit2, Plus } from "lucide-react";
import { ContextItem, ToolItem, PromptItem, PolicyItem } from "@/lib/types";

interface StudioSidebarProps {
  contextItems: ContextItem[];
  toolItems: ToolItem[];
  promptItems: PromptItem[];
  policyItems: PolicyItem[];
  onEditItem: (type: string, id: string) => void;
  onAddItem: (type: string) => void;
}

const StudioSidebar = ({
  contextItems,
  toolItems,
  promptItems,
  policyItems,
  onEditItem,
  onAddItem
}: StudioSidebarProps) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-medium mb-2">Agent Components</h2>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Context</h3>
          <div className="space-y-2">
            {contextItems.map((item) => (
              <div key={item.id} className="bg-gray-100 rounded-lg p-2 text-sm flex items-center justify-between">
                <span>{item.name}</span>
                <button onClick={() => onEditItem('context', item.id)}>
                  <Edit2 className="h-4 w-4 text-gray-500 cursor-pointer" />
                </button>
              </div>
            ))}
            <button 
              className="w-full flex items-center justify-center text-sm text-gray-500 p-2 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50"
              onClick={() => onAddItem('context')}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Context
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Tools</h3>
          <div className="space-y-2">
            {toolItems.map((item) => (
              <div key={item.id} className="bg-gray-100 rounded-lg p-2 text-sm flex items-center justify-between">
                <span>{item.name}</span>
                <button onClick={() => onEditItem('tool', item.id)}>
                  <Edit2 className="h-4 w-4 text-gray-500 cursor-pointer" />
                </button>
              </div>
            ))}
            <button 
              className="w-full flex items-center justify-center text-sm text-gray-500 p-2 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50"
              onClick={() => onAddItem('tool')}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Tool
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Prompt</h3>
          <div className="space-y-2">
            {promptItems.map((item) => (
              <div key={item.id} className="bg-primary/10 rounded-lg p-2 text-sm flex items-center justify-between">
                <span>{item.name}</span>
                <button onClick={() => onEditItem('prompt', item.id)}>
                  <Edit2 className="h-4 w-4 text-gray-500 cursor-pointer" />
                </button>
              </div>
            ))}
            <button 
              className="w-full flex items-center justify-center text-sm text-gray-500 p-2 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50"
              onClick={() => onAddItem('prompt')}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Prompt
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Policies</h3>
          <div className="space-y-2">
            {policyItems.map((item) => (
              <div key={item.id} className="bg-gray-100 rounded-lg p-2 text-sm flex items-center justify-between">
                <span>{item.name}</span>
                <button onClick={() => onEditItem('policy', item.id)}>
                  <Edit2 className="h-4 w-4 text-gray-500 cursor-pointer" />
                </button>
              </div>
            ))}
            <button 
              className="w-full flex items-center justify-center text-sm text-gray-500 p-2 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50"
              onClick={() => onAddItem('policy')}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioSidebar;
