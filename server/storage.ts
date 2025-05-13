import { 
  User, InsertUser, 
  Location, InsertLocation, 
  Attendance, InsertAttendance, 
  Message, InsertMessage,
  UserActivity
} from "@shared/schema";
import { db } from "./db";
import { users, locations, attendance, messages } from "@shared/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import connectPgSimple from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";

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
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    const PostgresStore = connectPgSimple(session);
    this.sessionStore = new PostgresStore({
      pool,
      createTableIfMissing: true,
    });
  }
  
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values({
      ...user,
      createdAt: new Date()
    }).returning();
    return newUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async getLocation(id: number): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.id, id));
    return location;
  }
  
  async getLocationsByUserId(userId: number): Promise<Location[]> {
    return await db
      .select()
      .from(locations)
      .where(eq(locations.userId, userId));
  }
  
  async createLocation(location: InsertLocation): Promise<Location> {
    const [newLocation] = await db
      .insert(locations)
      .values({
        ...location,
        timestamp: new Date()
      })
      .returning();
    return newLocation;
  }
  
  async updateLocation(userId: number, data: Partial<Location>): Promise<Location | undefined> {
    // Find the most recent location for this user
    const [userLocation] = await db
      .select()
      .from(locations)
      .where(eq(locations.userId, userId))
      .orderBy(desc(locations.timestamp))
      .limit(1);
      
    if (!userLocation) return undefined;
    
    // Update the location
    const [updatedLocation] = await db
      .update(locations)
      .set({
        ...data,
        timestamp: new Date()
      })
      .where(eq(locations.id, userLocation.id))
      .returning();
      
    return updatedLocation;
  }
  
  async getCurrentLocationForAllUsers(): Promise<Location[]> {
    // This query is more complex - for each user, we need the most recent location
    // We'll do this by getting all locations and processing them in memory
    const allLocations = await db.select().from(locations).orderBy(desc(locations.timestamp));
    
    // Create a map to store the most recent location for each user
    const userLocations = new Map<number, Location>();
    
    for (const location of allLocations) {
      const userId = location.userId;
      // If we don't have a location for this user yet, use this one
      if (!userLocations.has(userId)) {
        userLocations.set(userId, location);
      }
    }
    
    return Array.from(userLocations.values());
  }
  
  async getAttendance(id: number): Promise<Attendance | undefined> {
    const [record] = await db.select().from(attendance).where(eq(attendance.id, id));
    return record;
  }
  
  async getAttendanceByUserId(userId: number): Promise<Attendance[]> {
    return await db
      .select()
      .from(attendance)
      .where(eq(attendance.userId, userId));
  }
  
  async createAttendance(attendanceRecord: InsertAttendance): Promise<Attendance> {
    const [newAttendance] = await db
      .insert(attendance)
      .values(attendanceRecord)
      .returning();
    return newAttendance;
  }
  
  async updateAttendance(id: number, data: Partial<Attendance>): Promise<Attendance | undefined> {
    const [updatedAttendance] = await db
      .update(attendance)
      .set(data)
      .where(eq(attendance.id, id))
      .returning();
    return updatedAttendance;
  }
  
  async getTodayAttendance(): Promise<Attendance[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return await db
      .select()
      .from(attendance)
      .where(gte(attendance.checkInTime, today));
  }
  
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values({
        ...message,
        timestamp: new Date()
      })
      .returning();
    return newMessage;
  }
  
  async getRecentMessages(limit: number = 50): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .orderBy(desc(messages.timestamp))
      .limit(limit)
      .then(msgs => msgs.reverse()); // Return in chronological order
  }
  
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
export const storage = new DatabaseStorage();

// Seed database with initial data if needed
async function seedDatabase() {
  try {
    // Check if we have any users already
    const existingUsers = await storage.getAllUsers();
    
    if (existingUsers.length === 0) {
      console.log("🌱 Seeding database with initial data...");
      
      // Create sample admin user
      const admin = await storage.createUser({
        username: "admin",
        password: "admin123",
        name: "Sofia Martinez",
        role: "Administrator",
        avatarUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e",
        emoji: "👩‍💼"
      });
      
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
      
      // Create today's attendance records
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
      
      // Add some initial messages
      await storage.createMessage({
        senderId: ana.id,
        content: "Good morning team! Is everyone on site today? We have a client visit at 2pm.",
        isSystemMessage: false
      });
      
      await storage.createMessage({
        senderId: admin.id,
        content: "I'm at the main office. Will be in the meeting room preparing for the presentation.",
        isSystemMessage: false
      });
      
      console.log("✅ Database seeded successfully");
    } else {
      console.log("💡 Database already has data, skipping seed");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run the seed function
seedDatabase();
