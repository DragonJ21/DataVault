import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPersonalInfoSchema, insertTravelHistorySchema, insertFlightSchema, insertEmployerSchema, insertEducationSchema, insertAddressSchema } from "@shared/schema";
import { hashPassword, comparePassword, generateToken, authenticateToken, type AuthRequest } from "./services/auth";
import { fetchFlightData } from "./services/aviation-stack";
import { exportUserData } from "./services/export";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await hashPassword(validatedData.password);
      const { password, ...userData } = validatedData;
      const user = await storage.createUser({
        ...userData,
        password_hash: hashedPassword
      });

      const token = generateToken(user.id);
      const { password_hash, ...userWithoutPassword } = user;

      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user.id);
      const { password_hash, ...userWithoutPassword } = user;

      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      res.status(400).json({ message: "Login failed", error });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password_hash, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Personal info routes
  app.get("/api/personal-info", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const info = await storage.getPersonalInfo(req.userId!);
      res.json(info);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.post("/api/personal-info", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertPersonalInfoSchema.parse(req.body);
      const info = await storage.createPersonalInfo(req.userId!, validatedData);
      res.json(info);
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.put("/api/personal-info/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertPersonalInfoSchema.partial().parse(req.body);
      const info = await storage.updatePersonalInfo(req.params.id, req.userId!, validatedData);
      if (!info) {
        return res.status(404).json({ message: "Personal info not found" });
      }
      res.json(info);
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.delete("/api/personal-info/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const success = await storage.deletePersonalInfo(req.params.id, req.userId!);
      if (!success) {
        return res.status(404).json({ message: "Personal info not found" });
      }
      res.json({ message: "Personal info deleted" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Travel history routes
  app.get("/api/travel-history", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const history = await storage.getTravelHistory(req.userId!);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.post("/api/travel-history", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertTravelHistorySchema.parse(req.body);
      const entry = await storage.createTravelEntry(req.userId!, validatedData);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.put("/api/travel-history/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertTravelHistorySchema.partial().parse(req.body);
      const entry = await storage.updateTravelEntry(req.params.id, req.userId!, validatedData);
      if (!entry) {
        return res.status(404).json({ message: "Travel entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.delete("/api/travel-history/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const success = await storage.deleteTravelEntry(req.params.id, req.userId!);
      if (!success) {
        return res.status(404).json({ message: "Travel entry not found" });
      }
      res.json({ message: "Travel entry deleted" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Flight routes
  app.get("/api/flights", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const flights = await storage.getFlights(req.userId!);
      res.json(flights);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.post("/api/flights", authenticateToken, async (req: AuthRequest, res) => {
    try {
      let flightData = req.body;
      
      // Try to auto-fill from AviationStack if flight_number is provided
      if (flightData.flight_number && !flightData.airline) {
        const aviationData = await fetchFlightData(flightData.flight_number);
        if (aviationData) {
          flightData = { ...aviationData, ...flightData };
        }
      }

      const validatedData = insertFlightSchema.parse(flightData);
      const flight = await storage.createFlight(req.userId!, validatedData);
      res.json(flight);
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.put("/api/flights/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertFlightSchema.partial().parse(req.body);
      const flight = await storage.updateFlight(req.params.id, req.userId!, validatedData);
      if (!flight) {
        return res.status(404).json({ message: "Flight not found" });
      }
      res.json(flight);
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.delete("/api/flights/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const success = await storage.deleteFlight(req.params.id, req.userId!);
      if (!success) {
        return res.status(404).json({ message: "Flight not found" });
      }
      res.json({ message: "Flight deleted" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Employer routes
  app.get("/api/employers", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const employers = await storage.getEmployers(req.userId!);
      res.json(employers);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.post("/api/employers", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertEmployerSchema.parse(req.body);
      const employer = await storage.createEmployer(req.userId!, validatedData);
      res.json(employer);
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.put("/api/employers/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertEmployerSchema.partial().parse(req.body);
      const employer = await storage.updateEmployer(req.params.id, req.userId!, validatedData);
      if (!employer) {
        return res.status(404).json({ message: "Employer not found" });
      }
      res.json(employer);
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.delete("/api/employers/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const success = await storage.deleteEmployer(req.params.id, req.userId!);
      if (!success) {
        return res.status(404).json({ message: "Employer not found" });
      }
      res.json({ message: "Employer deleted" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Education routes
  app.get("/api/education", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const education = await storage.getEducation(req.userId!);
      res.json(education);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.post("/api/education", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertEducationSchema.parse(req.body);
      const education = await storage.createEducation(req.userId!, validatedData);
      res.json(education);
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.put("/api/education/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertEducationSchema.partial().parse(req.body);
      const education = await storage.updateEducation(req.params.id, req.userId!, validatedData);
      if (!education) {
        return res.status(404).json({ message: "Education record not found" });
      }
      res.json(education);
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.delete("/api/education/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const success = await storage.deleteEducation(req.params.id, req.userId!);
      if (!success) {
        return res.status(404).json({ message: "Education record not found" });
      }
      res.json({ message: "Education record deleted" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Address routes
  app.get("/api/addresses", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const addresses = await storage.getAddresses(req.userId!);
      res.json(addresses);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.post("/api/addresses", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertAddressSchema.parse(req.body);
      const address = await storage.createAddress(req.userId!, validatedData);
      res.json(address);
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.put("/api/addresses/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertAddressSchema.partial().parse(req.body);
      const address = await storage.updateAddress(req.params.id, req.userId!, validatedData);
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }
      res.json(address);
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.delete("/api/addresses/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const success = await storage.deleteAddress(req.params.id, req.userId!);
      if (!success) {
        return res.status(404).json({ message: "Address not found" });
      }
      res.json({ message: "Address deleted" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Export route
  app.get("/api/export/:format", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { format } = req.params;
      const sections = req.query.sections ? (req.query.sections as string).split(',') : ['travel', 'flights', 'employers', 'education', 'addresses', 'personal'];

      if (!['pdf', 'csv', 'excel', 'json'].includes(format)) {
        return res.status(400).json({ message: "Invalid export format" });
      }

      const exportData = await exportUserData(req.userId!, { 
        format: format as any, 
        sections 
      });

      const filename = `personal-data-export.${format === 'excel' ? 'xlsx' : format}`;
      
      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(exportData);
      } else {
        res.setHeader('Content-Type', format === 'pdf' ? 'application/pdf' : 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(exportData);
      }
    } catch (error) {
      res.status(500).json({ message: "Export failed", error });
    }
  });

  // Flight auto-fill route
  app.get("/api/flights/autofill/:flightNumber", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const flightData = await fetchFlightData(req.params.flightNumber);
      if (!flightData) {
        return res.status(404).json({ message: "Flight not found" });
      }
      res.json(flightData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch flight data", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
