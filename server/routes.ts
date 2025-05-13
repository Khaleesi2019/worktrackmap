import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertLocationSchema, insertAttendanceSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";
import express from "express";
import { checkRustDeskInstalled, connectToRustDesk, installRustDesk } from "./rustdesk";

type WebSocketMessage = {
  type: string;
  payload: any;
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Set up authentication
  setupAuth(app);

  // WebSocket setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store connected clients with their user IDs
  const connectedClients = new Map<number, WebSocket[]>();

  wss.on('connection', (ws) => {
    let userId: number | null = null;

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString()) as WebSocketMessage;

        switch (data.type) {
          case 'authenticate':
            userId = data.payload.userId;
            if (userId) {
              // Add this connection to the user's connections
              if (!connectedClients.has(userId)) {
                connectedClients.set(userId, []);
              }
              connectedClients.get(userId)?.push(ws);

              // Send last 50 messages to user
              const recentMessages = await storage.getRecentMessages(50);
              ws.send(JSON.stringify({
                type: 'message_history',
                payload: recentMessages
              }));

              // Broadcast user online status
              broadcastToAll({
                type: 'user_status',
                payload: {
                  userId,
                  status: 'online'
                }
              });
            }
            break;

          case 'location_update':
            if (userId) {
              try {
                const locationData = insertLocationSchema.parse({
                  ...data.payload,
                  userId
                });
                const location = await storage.createLocation(locationData);

                // Broadcast location update to all users
                broadcastToAll({
                  type: 'location_update',
                  payload: location
                });
              } catch (err) {
                if (err instanceof z.ZodError) {
                  ws.send(JSON.stringify({
                    type: 'error',
                    payload: fromZodError(err).message
                  }));
                }
              }
            }
            break;

          case 'chat_message':
            if (userId) {
              try {
                const messageData = insertMessageSchema.parse({
                  ...data.payload,
                  senderId: userId
                });

                const message = await storage.createMessage(messageData);

                // Broadcast to all connected clients
                broadcastToAll({
                  type: 'new_message',
                  payload: message
                });
              } catch (err) {
                if (err instanceof z.ZodError) {
                  ws.send(JSON.stringify({
                    type: 'error',
                    payload: fromZodError(err).message
                  }));
                }
              }
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (userId) {
        // Remove this connection from user's connections
        const userConnections = connectedClients.get(userId) || [];
        const updatedConnections = userConnections.filter(conn => conn !== ws);

        if (updatedConnections.length === 0) {
          // User has no more active connections
          connectedClients.delete(userId);

          // Broadcast user offline status
          broadcastToAll({
            type: 'user_status',
            payload: {
              userId,
              status: 'offline'
            }
          });
        } else {
          connectedClients.set(userId, updatedConnections);
        }
      }
    });
  });

  // Helper function to broadcast to all connected clients
  function broadcastToAll(data: WebSocketMessage) {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  // =========== REST API Routes ===========

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
  };

  // User routes
  // /api/login, /api/register, /api/logout, and /api/user are handled by setupAuth

  app.get('/api/users', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from the response
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      return res.status(200).json(usersWithoutPasswords);
    } catch (error) {
      console.error('Get users error:', error);
      return res.status(500).json({ message: 'Server error fetching users' });
    }
  });

  app.get('/api/users/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Remove password from the response
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error('Get user error:', error);
      return res.status(500).json({ message: 'Server error fetching user' });
    }
  });

  // Location routes
  app.get('/api/locations', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const locations = await storage.getCurrentLocationForAllUsers();
      return res.status(200).json(locations);
    } catch (error) {
      console.error('Get locations error:', error);
      return res.status(500).json({ message: 'Server error fetching locations' });
    }
  });

  app.post('/api/locations', isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Use the authenticated user's ID
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const locationData = insertLocationSchema.parse({
        ...req.body,
        userId
      });

      const location = await storage.createLocation(locationData);

      // Log this activity
      await storage.logUserActivity({
        type: 'location_update',
        userId,
        timestamp: new Date(),
        details: locationData.locationName || 'Unknown location'
      });

      return res.status(201).json(location);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error('Create location error:', error);
      return res.status(500).json({ message: 'Server error creating location' });
    }
  });

  app.get('/api/locations/user/:userId', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const locations = await storage.getLocationsByUserId(userId);
      return res.status(200).json(locations);
    } catch (error) {
      console.error('Get user locations error:', error);
      return res.status(500).json({ message: 'Server error fetching user locations' });
    }
  });

  // Attendance routes
  app.get('/api/attendance', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const attendance = await storage.getTodayAttendance();
      return res.status(200).json(attendance);
    } catch (error) {
      console.error('Get attendance error:', error);
      return res.status(500).json({ message: 'Server error fetching attendance' });
    }
  });

  app.post('/api/attendance', isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Use the authenticated user's ID
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const attendanceData = insertAttendanceSchema.parse({
        ...req.body,
        userId
      });

      const attendance = await storage.createAttendance(attendanceData);

      // Log this activity
      await storage.logUserActivity({
        type: 'check_in',
        userId,
        timestamp: attendanceData.checkInTime
      });

      return res.status(201).json(attendance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error('Create attendance error:', error);
      return res.status(500).json({ message: 'Server error creating attendance' });
    }
  });

  app.patch('/api/attendance/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const attendanceId = parseInt(req.params.id);
      const attendance = await storage.getAttendance(attendanceId);

      if (!attendance) {
        return res.status(404).json({ message: 'Attendance record not found' });
      }

      // Ensure users can only update their own attendance
      if (attendance.userId !== req.user?.id) {
        return res.status(403).json({ message: 'Not authorized to update this attendance record' });
      }

      const updatedAttendance = await storage.updateAttendance(attendanceId, req.body);

      // If check-out time was updated, log the activity
      if (req.body.checkOutTime) {
        await storage.logUserActivity({
          type: 'check_out',
          userId: attendance.userId,
          timestamp: new Date(req.body.checkOutTime)
        });
      }

      return res.status(200).json(updatedAttendance);
    } catch (error) {
      console.error('Update attendance error:', error);
      return res.status(500).json({ message: 'Server error updating attendance' });
    }
  });

  app.get('/api/attendance/user/:userId', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);

      // Ensure users can only access their own attendance or admins can access any
      if (userId !== req.user?.id && req.user?.role !== 'Administrator') {
        return res.status(403).json({ message: 'Not authorized to access this attendance data' });
      }

      const attendance = await storage.getAttendanceByUserId(userId);
      return res.status(200).json(attendance);
    } catch (error) {
      console.error('Get user attendance error:', error);
      return res.status(500).json({ message: 'Server error fetching user attendance' });
    }
  });

  // Message routes
  app.get('/api/messages', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const messages = await storage.getRecentMessages(limit);
      return res.status(200).json(messages);
    } catch (error) {
      console.error('Get messages error:', error);
      return res.status(500).json({ message: 'Server error fetching messages' });
    }
  });

  // RustDesk routes
  app.get("/api/rustdesk/status", async (req, res) => {
    const installed = await checkRustDeskInstalled();
    res.json({ installed });
  });

  app.post("/api/rustdesk/connect", async (req, res) => {
    const { serverId, password } = req.body;
    const result = await connectToRustDesk(serverId, password);
    res.json(result);
  });

  app.post("/api/rustdesk/install", async (req, res) => {
    const result = await installRustDesk();
    res.json(result);
  });

  return httpServer;
}