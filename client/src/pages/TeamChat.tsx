import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/context/LanguageContext";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/context/AuthContext";
import ChatPanel from "@/components/chat/ChatPanel";
import { User } from "@/types";

export default function TeamChat() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isConnected, messages } = useWebSocket();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Fetch all users
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex justify-center h-full">
      <div className="w-full max-w-5xl h-full flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h1 className="text-xl font-bold">{t('teamChat')}</h1>
            <div className="flex items-center text-sm text-muted-foreground">
              <div className={`w-2 h-2 rounded-full mr-1 ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`}></div>
              <span>{isConnected ? t('online') : t('offline')}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 h-full">
          <ChatPanel 
            fullWidth={true}
            users={users || []}
            hideHeader={true}
          />
        </div>
      </div>
    </div>
  );
}
