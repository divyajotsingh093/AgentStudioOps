import { ChatMessage as ChatMessageType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div 
      className={cn(
        "chat-bubble",
        message.role === "user" ? "user" : "agent"
      )}
    >
      {message.tool && (
        <div className="mb-2 text-xs text-gray-500">Using tool: {message.tool}</div>
      )}
      <p className="whitespace-pre-line">{message.content}</p>
    </div>
  );
};

export default ChatMessage;
