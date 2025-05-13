import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isConnected: boolean;
}

export default function ChatInput({
  onSendMessage,
  isConnected
}: ChatInputProps) {
  const { t } = useLanguage();
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus input on component mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && isConnected) {
      onSendMessage(message);
      setMessage("");
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-3 border-t border-border">
      <form onSubmit={handleSubmit} className="flex items-center bg-secondary dark:bg-secondary rounded-lg px-3 py-2">
        <button 
          type="button"
          className="text-muted-foreground mr-2"
          disabled={!isConnected}
        >
          <i className="far fa-smile"></i>
        </button>
        <input 
          type="text" 
          ref={inputRef}
          placeholder={t("typeMessage")} 
          className="flex-1 bg-transparent border-none focus:outline-none text-foreground dark:text-foreground" 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!isConnected}
        />
        <button 
          type="button"
          className="text-muted-foreground ml-2"
          disabled={!isConnected}
        >
          <i className="fas fa-paperclip"></i>
        </button>
        <Button
          type="submit"
          size="icon"
          className={cn(
            "ml-2 p-1.5 rounded-full",
            !message.trim() || !isConnected ? "opacity-50 cursor-not-allowed" : ""
          )}
          disabled={!message.trim() || !isConnected}
        >
          <i className="fas fa-paper-plane"></i>
        </Button>
      </form>
    </div>
  );
}
