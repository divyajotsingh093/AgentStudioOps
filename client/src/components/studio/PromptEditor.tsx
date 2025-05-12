import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PromptItem } from "@/lib/types";

interface PromptEditorProps {
  prompt: PromptItem;
  onSave: (prompt: PromptItem) => void;
  onCancel: () => void;
}

const PromptEditor = ({ prompt, onSave, onCancel }: PromptEditorProps) => {
  const [name, setName] = useState(prompt.name);
  const [content, setContent] = useState(prompt.content);
  
  const handleSave = () => {
    onSave({
      ...prompt,
      name,
      content
    });
  };
  
  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-medium">Prompt Editor</h2>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Prompt Name</label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Prompt Template</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-64 font-mono text-sm"
          />
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex justify-end">
          <Button variant="outline" className="mr-2" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Prompt
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PromptEditor;
