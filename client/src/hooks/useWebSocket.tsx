import { useEffect, useRef, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Message, Location } from "@/types";

type WebSocketMessage = {
  type: string;
  payload: any;
};

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userStatuses, setUserStatuses] = useState<Map<number, string>>(new Map());
  const [locations, setLocations] = useState<Location[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();
  
  // Function to connect to WebSocket
  const connect = useCallback((userId: number) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      return; // Already connected
    }
    
    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    socketRef.current = new WebSocket(wsUrl);
    
    socketRef.current.onopen = () => {
      setIsConnected(true);
      console.log("WebSocket connected");
      
      // Authenticate with the server
      if (socketRef.current) {
        socketRef.current.send(JSON.stringify({
          type: "authenticate",
          payload: { userId }
        }));
      }
    };
    
    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketMessage;
        
        switch (data.type) {
          case "message_history":
            setMessages(data.payload);
            break;
            
          case "new_message":
            setMessages(prev => [...prev, data.payload]);
            break;
            
          case "user_status":
            setUserStatuses(prev => {
              const newMap = new Map(prev);
              newMap.set(data.payload.userId, data.payload.status);
              return newMap;
            });
            break;
            
          case "location_update":
            setLocations(prev => {
              // Filter out previous location for this user if it exists
              const filtered = prev.filter(loc => loc.userId !== data.payload.userId);
              // Add new location
              return [...filtered, data.payload];
            });
            break;
            
          case "error":
            toast({
              title: "WebSocket Error",
              description: data.payload,
              variant: "destructive",
            });
            break;
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };
    
    socketRef.current.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket disconnected");
      
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (userId) connect(userId);
      }, 5000);
    };
    
    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to the server. Retrying...",
        variant: "destructive",
      });
    };
  }, [toast]);
  
  // Function to disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);
  
  // Function to send a chat message
  const sendMessage = useCallback((content: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "chat_message",
        payload: { content }
      }));
      return true;
    }
    return false;
  }, []);
  
  // Function to send a location update
  const updateLocation = useCallback((userId: number, location: { 
    latitude: string; 
    longitude: string; 
    locationName?: string;
    status?: string;
  }) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "location_update",
        payload: {
          userId,
          ...location
        }
      }));
      return true;
    }
    return false;
  }, []);
  
  // Clean up WebSocket on component unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);
  
  return {
    isConnected,
    messages,
    userStatuses,
    locations,
    connect,
    disconnect,
    sendMessage,
    updateLocation
  };
}
