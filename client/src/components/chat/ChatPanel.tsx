import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Button } from "@/components/ui/button";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { User, Message } from "@/types";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  onClose?: () => void;
  targetUserId?: number | null;
  users: User[];
  fullWidth?: boolean;
  hideHeader?: boolean;
}

export default function ChatPanel({
  onClose,
  targetUserId,
  users,
  fullWidth = false,
  hideHeader = false
}: ChatPanelProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { messages, sendMessage, userStatuses, isConnected } = useWebSocket();
  const [groupedMessages, setGroupedMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Filter messages if targetUserId is provided, otherwise show all
  const filteredMessages = targetUserId 
    ? messages.filter(msg => msg.senderId === targetUserId || (user && msg.senderId === user.id))
    : messages;
  
  // Group messages by date
  useEffect(() => {
    const grouped: any[] = [];
    let currentDate = '';
    let currentMessages: Message[] = [];
    
    filteredMessages.forEach((msg, index) => {
      const msgDate = new Date(msg.timestamp).toLocaleDateString();
      
      if (msgDate !== currentDate) {
        if (currentMessages.length > 0) {
          grouped.push({
            date: currentDate,
            messages: [...currentMessages]
          });
          currentMessages = [];
        }
        currentDate = msgDate;
      }
      
      currentMessages.push(msg);
      
      // Add the last group
      if (index === filteredMessages.length - 1 && currentMessages.length > 0) {
        grouped.push({
          date: currentDate,
          messages: [...currentMessages]
        });
      }
    });
    
    setGroupedMessages(grouped);
  }, [filteredMessages]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [groupedMessages]);
  
  // Count online users
  const onlineUsersCount = Array.from(userStatuses.entries())
    .filter(([_, status]) => status === 'online')
    .length;
  
  // Handle sending a message
  const handleSendMessage = (content: string) => {
    if (content.trim() && sendMessage(content)) {
      // Message sent successfully via WebSocket
      // The message will be added to the chat via the WebSocket event
    }
  };
  
  // Get user name by ID
  const getUserName = (userId: number): string => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser ? foundUser.name : `User #${userId}`;
  };
  
  // Get user avatar by ID
  const getUserAvatar = (userId: number): string | undefined => {
    return users.find(u => u.id === userId)?.avatarUrl;
  };

  return (
    <div 
      id="chat-panel" 
      className={cn(
        "bg-background border-l border-border flex flex-col",
        fullWidth ? "w-full" : "w-80",
        fullWidth ? "" : "z-[600]"
      )}
    >
      {!hideHeader && (
        <div className="p-4 border-b border-border flex justify-between items-center">
          <div className="flex items-center">
            {onClose && (
              <button 
                id="close-chat" 
                className="mr-3 text-muted-foreground lg:hidden"
                onClick={onClose}
              >
                <i className="fas fa-arrow-left"></i>
              </button>
            )}
            <div>
              <h2 className="font-medium">{t("teamChat")}</h2>
              <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                <div className={cn(
                  "w-2 h-2 rounded-full mr-1",
                  isConnected ? "bg-green-500" : "bg-gray-500"
                )}></div>
                <span>{onlineUsersCount} {t("onlineUsers")}</span>
              </div>
            </div>
          </div>
          {onClose && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="text-muted-foreground"
            >
              <i className="fas fa-ellipsis-v"></i>
            </Button>
          )}
        </div>
      )}
      
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {groupedMessages.length > 0 ? (
          groupedMessages.map((group, groupIndex) => (
            <div key={`group-${groupIndex}`}>
              {/* Day separator */}
              <div className="flex items-center justify-center text-xs text-muted-foreground my-2">
                <div className="border-t border-border flex-grow mr-2"></div>
                <span>{group.date === new Date().toLocaleDateString() ? t("today") : group.date}</span>
                <div className="border-t border-border flex-grow ml-2"></div>
              </div>
              
              {group.messages.map((msg: Message, msgIndex: number) => (
                <ChatMessage 
                  key={`msg-${msg.id || msgIndex}`}
                  message={msg}
                  isSent={user?.id === msg.senderId}
                  senderName={getUserName(msg.senderId)}
                  senderAvatar={getUserAvatar(msg.senderId)}
                />
              ))}
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-muted-foreground">
              {isConnected ? "No messages yet. Start a conversation!" : "Connecting..."}
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat input area */}
      <ChatInput 
        onSendMessage={handleSendMessage}
        isConnected={isConnected}
      />
    </div>
  );
}
