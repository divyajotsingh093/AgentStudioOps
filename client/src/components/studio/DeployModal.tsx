import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeployModal = ({ isOpen, onClose }: DeployModalProps) => {
  const [environment, setEnvironment] = useState<'dev' | 'prod'>('dev');
  const [notes, setNotes] = useState('');
  
  const handleDeploy = () => {
    // Implement deployment logic here
    console.log(`Deploying to ${environment} with notes: ${notes}`);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deploy Agent</DialogTitle>
          <DialogDescription>
            Deploy your agent to the selected environment. Production deployments require approval.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4">
            <Label className="text-base">Environment</Label>
            <RadioGroup value={environment} onValueChange={(value) => setEnvironment(value as 'dev' | 'prod')}>
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="dev" id="r1" />
                <Label htmlFor="r1" className="font-normal">Development</Label>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="prod" id="r2" />
                <Label htmlFor="r2" className="font-normal">Production</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label htmlFor="notes">Version Notes</Label>
            <Textarea
              id="notes"
              placeholder="Describe the changes in this version..."
              className="mt-2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleDeploy}>Publish</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeployModal;
