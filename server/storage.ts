import { 
  User, InsertUser, 
  Location, InsertLocation, 
  Attendance, InsertAttendance, 
  Message, InsertMessage,
  UserActivity
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Location methods
  getLocation(id: number): Promise<Location | undefined>;
  getLocationsByUserId(userId: number): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(userId: number, location: Partial<Location>): Promise<Location | undefined>;
  getCurrentLocationForAllUsers(): Promise<Location[]>;
  
  // Attendance methods
  getAttendance(id: number): Promise<Attendance | undefined>;
  getAttendanceByUserId(userId: number): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: number, data: Partial<Attendance>): Promise<Attendance | undefined>;
  getTodayAttendance(): Promise<Attendance[]>;
  
  // Message methods
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  getRecentMessages(limit?: number): Promise<Message[]>;
  
  // Activity logging
  logUserActivity(activity: UserActivity): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private locations: Map<number, Location>;
  private attendance: Map<number, Attendance>;
  private messages: Map<number, Message>;
  private userId: number;
  private locationId: number;
  private attendanceId: number;
  private messageId: number;

  constructor() {
    this.users = new Map();
    this.locations = new Map();
    this.attendance = new Map();
    this.messages = new Map();
    this.userId = 1;
    this.locationId = 1;
    this.attendanceId = 1;
    this.messageId = 1;
    
    // Initialize with sample admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      name: "Sofia Martinez",
      role: "Admin",
      avatarUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e",
      emoji: "👩‍💼"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id, createdAt: new Date() };
    this.users.set(id, newUser);
    return newUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Location methods
  async getLocation(id: number): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async getLocationsByUserId(userId: number): Promise<Location[]> {
    return Array.from(this.locations.values()).filter(
      (location) => location.userId === userId
    );
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const id = this.locationId++;
    const newLocation: Location = { ...location, id, timestamp: new Date() };
    this.locations.set(id, newLocation);
    return newLocation;
  }

  async updateLocation(userId: number, data: Partial<Location>): Promise<Location | undefined> {
    const userLocations = await this.getLocationsByUserId(userId);
    if (userLocations.length === 0) return undefined;
    
    // Update the most recent location
    const mostRecent = userLocations.sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    )[0];
    
    const updatedLocation = { ...mostRecent, ...data, timestamp: new Date() };
    this.locations.set(mostRecent.id, updatedLocation);
    return updatedLocation;
  }

  async getCurrentLocationForAllUsers(): Promise<Location[]> {
    const userIds = new Set(Array.from(this.users.keys()));
    const result: Location[] = [];
    
    for (const userId of userIds) {
      const locations = await this.getLocationsByUserId(userId);
      if (locations.length > 0) {
        // Get the most recent location
        const mostRecent = locations.sort((a, b) => 
          b.timestamp.getTime() - a.timestamp.getTime()
        )[0];
        result.push(mostRecent);
      }
    }
    
    return result;
  }

  // Attendance methods
  async getAttendance(id: number): Promise<Attendance | undefined> {
    return this.attendance.get(id);
  }

  async getAttendanceByUserId(userId: number): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).filter(
      (record) => record.userId === userId
    );
  }

  async createAttendance(attendance: InsertAttendance): Promise<Attendance> {
    const id = this.attendanceId++;
    const newAttendance: Attendance = { ...attendance, id };
    this.attendance.set(id, newAttendance);
    return newAttendance;
  }

  async updateAttendance(id: number, data: Partial<Attendance>): Promise<Attendance | undefined> {
    const attendance = await this.getAttendance(id);
    if (!attendance) return undefined;
    
    const updatedAttendance = { ...attendance, ...data };
    this.attendance.set(id, updatedAttendance);
    return updatedAttendance;
  }

  async getTodayAttendance(): Promise<Attendance[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.attendance.values()).filter((record) => {
      const recordDate = new Date(record.checkInTime);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === today.getTime();
    });
  }

  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const newMessage: Message = { ...message, id, timestamp: new Date() };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async getRecentMessages(limit: number = 50): Promise<Message[]> {
    return Array.from(this.messages.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
      .reverse(); // Return in chronological order
  }

  // Activity logging
  async logUserActivity(activity: UserActivity): Promise<void> {
    // Create a system message based on the activity type
    let content = "";
    const user = await this.getUser(activity.userId);
    const userName = user ? user.name : `User #${activity.userId}`;
    
    switch (activity.type) {
      case "check_in":
        content = `${userName} checked in at ${activity.timestamp.toLocaleTimeString()}`;
        break;
      case "check_out":
        content = `${userName} checked out at ${activity.timestamp.toLocaleTimeString()}`;
        break;
      case "status_change":
        content = `${userName} changed status to ${activity.details || "unknown"}`;
        break;
      case "location_update":
        content = `${userName} updated location to ${activity.details || "unknown"}`;
        break;
    }
    
    await this.createMessage({
      senderId: activity.userId,
      content,
      isSystemMessage: true,
    });
  }
}

// Initialize storage
export const storage = new MemStorage();

// Add some initial data
(async () => {
  // Create sample users
  const carlos = await storage.createUser({
    username: "carlos",
    password: "password",
    name: "Carlos Rodriguez",
    role: "Developer",
    avatarUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5",
    emoji: "👨‍💻"
  });
  
  const ana = await storage.createUser({
    username: "ana",
    password: "password",
    name: "Ana Martinez",
    role: "Project Manager",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    emoji: "👩‍💼"
  });
  
  const miguel = await storage.createUser({
    username: "miguel",
    password: "password",
    name: "Miguel Torres",
    role: "Field Technician",
    avatarUrl: "https://images.unsplash.com/photo-1558203728-00f45181dd84",
    emoji: "👨‍🔧"
  });
  
  const laura = await storage.createUser({
    username: "laura",
    password: "password",
    name: "Laura Silva",
    role: "UX Designer",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    emoji: "👩‍🎨"
  });
  
  const alex = await storage.createUser({
    username: "alex",
    password: "password",
    name: "Alex Morales",
    role: "Data Analyst",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    emoji: "🧑‍🚀"
  });
  
  const javier = await storage.createUser({
    username: "javier",
    password: "password",
    name: "Javier Ruiz",
    role: "Research Specialist",
    avatarUrl: "https://images.unsplash.com/photo-1618077360395-f3068be8e001",
    emoji: "👨‍🔬"
  });
  
  // Add some sample locations
  await storage.createLocation({
    userId: carlos.id,
    latitude: "40.712776",
    longitude: "-74.005974",
    locationName: "Main Office",
    status: "active"
  });
  
  await storage.createLocation({
    userId: ana.id,
    latitude: "40.714541",
    longitude: "-74.007081",
    locationName: "Main Office",
    status: "active"
  });
  
  await storage.createLocation({
    userId: miguel.id,
    latitude: "40.711531",
    longitude: "-74.013512",
    locationName: "Field Site A",
    status: "active"
  });
  
  await storage.createLocation({
    userId: laura.id,
    latitude: "40.718217",
    longitude: "-74.014729",
    locationName: "Design Studio",
    status: "away"
  });
  
  await storage.createLocation({
    userId: alex.id,
    latitude: "40.712857",
    longitude: "-74.009951",
    locationName: "Main Office",
    status: "active"
  });
  
  await storage.createLocation({
    userId: javier.id,
    latitude: "40.709114",
    longitude: "-74.011139",
    locationName: "Research Lab",
    status: "offline"
  });
  
  // Create attendance records
  const today = new Date();
  
  await storage.createAttendance({
    userId: carlos.id,
    checkInTime: new Date(today.setHours(9, 30, 0, 0)),
    status: "present"
  });
  
  await storage.createAttendance({
    userId: ana.id,
    checkInTime: new Date(today.setHours(9, 5, 0, 0)),
    status: "present"
  });
  
  await storage.createAttendance({
    userId: miguel.id,
    checkInTime: new Date(today.setHours(8, 30, 0, 0)),
    status: "present"
  });
  
  await storage.createAttendance({
    userId: laura.id,
    checkInTime: new Date(today.setHours(9, 45, 0, 0)),
    status: "present"
  });
  
  await storage.createAttendance({
    userId: alex.id,
    checkInTime: new Date(today.setHours(8, 45, 0, 0)),
    status: "present"
  });
  
  // Add some messages
  await storage.createMessage({
    senderId: ana.id,
    content: "Good morning team! Is everyone on site today? We have a client visit at 2pm."
  });
  
  await storage.createMessage({
    senderId: 1, // Admin
    content: "I'm at the main office. Will be in the meeting room preparing for the presentation."
  });
  
  await storage.createMessage({
    senderId: carlos.id,
    content: "I'm working remotely this morning but will be at the office for the client meeting. Do we need to prepare any extra materials?"
  });
  
  await storage.createMessage({
    senderId: miguel.id,
    content: "Just finished the site inspection. Everything looks good! 👍"
  });
  
  await storage.createMessage({
    senderId: ana.id,
    content: "@Carlos please bring the project portfolio and the latest analytics report."
  });
  
  await storage.createMessage({
    senderId: 1, // Admin
    content: "I'll set up the conference room and make sure all the presentations are ready to go."
  });
  
  // Log activity
  await storage.logUserActivity({
    type: "check_in",
    userId: miguel.id,
    timestamp: new Date(today.setHours(8, 30, 0, 0))
  });
})();
