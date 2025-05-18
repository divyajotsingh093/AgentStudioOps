import { Helmet } from "react-helmet";
import { TaskTimelineBoard } from "@/components/TaskTimelineBoard";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function TasksPage() {
  const [taskUpdating, setTaskUpdating] = useState<string | null>(null);
  
  const handleApproveTask = async (taskId: string) => {
    setTaskUpdating(taskId);
    
    try {
      // In a real implementation, this would be an API call
      // await fetch(`/api/tasks/${taskId}/approve`, { method: 'POST' });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Task approved",
        description: "The task has been approved and will continue execution.",
      });
    } catch (error) {
      toast({
        title: "Failed to approve task",
        description: "An error occurred while approving the task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTaskUpdating(null);
    }
  };
  
  const handleRerunTask = async (taskId: string) => {
    setTaskUpdating(taskId);
    
    try {
      // In a real implementation, this would be an API call
      // await fetch(`/api/tasks/${taskId}/rerun`, { method: 'POST' });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Task restarted",
        description: "The task has been queued to run again.",
      });
    } catch (error) {
      toast({
        title: "Failed to restart task",
        description: "An error occurred while restarting the task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTaskUpdating(null);
    }
  };
  
  const handleViewTaskDetail = (taskId: string) => {
    // In a real app, this could navigate to a detailed task page
    console.log("View task detail:", taskId);
  };

  return (
    <>
      <Helmet>
        <title>Task Timeline - Neutrinos AI Agent Platform</title>
        <meta 
          name="description" 
          content="Manage and monitor agent tasks in real-time with the timeline board" 
        />
      </Helmet>
      
      <TaskTimelineBoard 
        onApproveTask={handleApproveTask}
        onRerunTask={handleRerunTask}
        onViewTaskDetail={handleViewTaskDetail}
      />
    </>
  );
}