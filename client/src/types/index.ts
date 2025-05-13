// User related types
export interface User {
  id: number;
  username: string;
  name: string;
  role: string;
  avatarUrl?: string;
  emoji?: string;
  createdAt: Date;
}

// Location related types
export interface Location {
  id: number;
  userId: number;
  latitude: string;
  longitude: string;
  locationName?: string;
  status: string;
  timestamp: Date;
}

// Attendance related types
export interface Attendance {
  id: number;
  userId: number;
  checkInTime: Date;
  checkOutTime?: Date;
  status: string;
  notes?: string;
}

// Message related types
export interface Message {
  id: number;
  senderId: number;
  content: string;
  timestamp: Date;
  isSystemMessage: boolean;
}

// Response types
export type ErrorResponse = {
  message: string;
};

// WebSocket related types
export interface WebSocketMessage {
  type: string;
  payload: any;
}

export interface UserStatus {
  userId: number;
  status: 'online' | 'offline' | 'away';
}

// Settings related types
export type Theme = 'light' | 'dark';
export type Language = 'en' | 'es';
