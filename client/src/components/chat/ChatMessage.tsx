import { formatChatTime } from "@/lib/utils";
import { Message } from "@/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ChatMessageProps {
  message: Message;
  isSent: boolean;
  senderName: string;
  senderAvatar?: string;
}

export default function ChatMessage({
  message,
  isSent,
  senderName,
  senderAvatar
}: ChatMessageProps) {
  // Check if it's a system message
  if (message.isSystemMessage) {
    return (
      <div className="text-center text-xs text-muted-foreground">
        <span>{message.content}</span>
      </div>
    );
  }
  
  // Format sender name to first name + initial
  const formatName = (name: string): string => {
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0]} ${nameParts[1].charAt(0)}.`;
    }
    return name;
  };

  return (
    <div className={cn(
      "flex items-start",
      isSent && "justify-end"
    )}>
      {!isSent && (
        <Avatar className="w-8 h-8 mr-2">
          {senderAvatar ? (
            <AvatarImage src={senderAvatar} alt={senderName} className="object-cover" />
          ) : (
            <AvatarFallback>{senderName.charAt(0)}</AvatarFallback>
          )}
        </Avatar>
      )}
      <div className={cn(
        "max-w-[80%]",
        isSent && "text-right"
      )}>
        <div className={cn(
          "p-3 rounded-lg",
          isSent 
            ? "bg-primary text-primary-foreground chat-bubble-sent" 
            : "bg-secondary dark:bg-secondary chat-bubble-received"
        )}>
          <p className="text-sm">{message.content}</p>
        </div>
        <span className="text-xs text-muted-foreground mt-1">
          {formatName(senderName)} • {formatChatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
