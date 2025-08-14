import { type User, type InsertUser, type PersonalInfo, type InsertPersonalInfo, type TravelHistory, type InsertTravelHistory, type Flight, type InsertFlight, type Employer, type InsertEmployer, type Education, type InsertEducation, type Address, type InsertAddress } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Personal info methods
  getPersonalInfo(userId: string): Promise<PersonalInfo | undefined>;
  createPersonalInfo(userId: string, info: InsertPersonalInfo): Promise<PersonalInfo>;
  updatePersonalInfo(id: string, userId: string, info: Partial<InsertPersonalInfo>): Promise<PersonalInfo | undefined>;
  deletePersonalInfo(id: string, userId: string): Promise<boolean>;

  // Travel history methods
  getTravelHistory(userId: string): Promise<TravelHistory[]>;
  createTravelEntry(userId: string, entry: InsertTravelHistory): Promise<TravelHistory>;
  updateTravelEntry(id: string, userId: string, entry: Partial<InsertTravelHistory>): Promise<TravelHistory | undefined>;
  deleteTravelEntry(id: string, userId: string): Promise<boolean>;

  // Flight methods
  getFlights(userId: string): Promise<Flight[]>;
  createFlight(userId: string, flight: InsertFlight): Promise<Flight>;
  updateFlight(id: string, userId: string, flight: Partial<InsertFlight>): Promise<Flight | undefined>;
  deleteFlight(id: string, userId: string): Promise<boolean>;

  // Employer methods
  getEmployers(userId: string): Promise<Employer[]>;
  createEmployer(userId: string, employer: InsertEmployer): Promise<Employer>;
  updateEmployer(id: string, userId: string, employer: Partial<InsertEmployer>): Promise<Employer | undefined>;
  deleteEmployer(id: string, userId: string): Promise<boolean>;

  // Education methods
  getEducation(userId: string): Promise<Education[]>;
  createEducation(userId: string, education: InsertEducation): Promise<Education>;
  updateEducation(id: string, userId: string, education: Partial<InsertEducation>): Promise<Education | undefined>;
  deleteEducation(id: string, userId: string): Promise<boolean>;

  // Address methods
  getAddresses(userId: string): Promise<Address[]>;
  createAddress(userId: string, address: InsertAddress): Promise<Address>;
  updateAddress(id: string, userId: string, address: Partial<InsertAddress>): Promise<Address | undefined>;
  deleteAddress(id: string, userId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private personalInfo: Map<string, PersonalInfo> = new Map();
  private travelHistory: Map<string, TravelHistory> = new Map();
  private flights: Map<string, Flight> = new Map();
  private employers: Map<string, Employer> = new Map();
  private education: Map<string, Education> = new Map();
  private addresses: Map<string, Address> = new Map();

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      created_at: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Personal info methods
  async getPersonalInfo(userId: string): Promise<PersonalInfo | undefined> {
    return Array.from(this.personalInfo.values()).find(info => info.user_id === userId);
  }

  async createPersonalInfo(userId: string, info: InsertPersonalInfo): Promise<PersonalInfo> {
    const id = randomUUID();
    const personalInfo: PersonalInfo = { ...info, id, user_id: userId };
    this.personalInfo.set(id, personalInfo);
    return personalInfo;
  }

  async updatePersonalInfo(id: string, userId: string, info: Partial<InsertPersonalInfo>): Promise<PersonalInfo | undefined> {
    const existing = this.personalInfo.get(id);
    if (!existing || existing.user_id !== userId) return undefined;
    
    const updated = { ...existing, ...info };
    this.personalInfo.set(id, updated);
    return updated;
  }

  async deletePersonalInfo(id: string, userId: string): Promise<boolean> {
    const existing = this.personalInfo.get(id);
    if (!existing || existing.user_id !== userId) return false;
    
    return this.personalInfo.delete(id);
  }

  // Travel history methods
  async getTravelHistory(userId: string): Promise<TravelHistory[]> {
    return Array.from(this.travelHistory.values())
      .filter(entry => entry.user_id === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createTravelEntry(userId: string, entry: InsertTravelHistory): Promise<TravelHistory> {
    const id = randomUUID();
    const travelEntry: TravelHistory = { ...entry, id, user_id: userId };
    this.travelHistory.set(id, travelEntry);
    return travelEntry;
  }

  async updateTravelEntry(id: string, userId: string, entry: Partial<InsertTravelHistory>): Promise<TravelHistory | undefined> {
    const existing = this.travelHistory.get(id);
    if (!existing || existing.user_id !== userId) return undefined;
    
    const updated = { ...existing, ...entry };
    this.travelHistory.set(id, updated);
    return updated;
  }

  async deleteTravelEntry(id: string, userId: string): Promise<boolean> {
    const existing = this.travelHistory.get(id);
    if (!existing || existing.user_id !== userId) return false;
    
    return this.travelHistory.delete(id);
  }

  // Flight methods
  async getFlights(userId: string): Promise<Flight[]> {
    return Array.from(this.flights.values())
      .filter(flight => flight.user_id === userId)
      .sort((a, b) => {
        if (!a.departure_time || !b.departure_time) return 0;
        return new Date(b.departure_time).getTime() - new Date(a.departure_time).getTime();
      });
  }

  async createFlight(userId: string, flight: InsertFlight): Promise<Flight> {
    const id = randomUUID();
    const flightEntry: Flight = { ...flight, id, user_id: userId };
    this.flights.set(id, flightEntry);
    return flightEntry;
  }

  async updateFlight(id: string, userId: string, flight: Partial<InsertFlight>): Promise<Flight | undefined> {
    const existing = this.flights.get(id);
    if (!existing || existing.user_id !== userId) return undefined;
    
    const updated = { ...existing, ...flight };
    this.flights.set(id, updated);
    return updated;
  }

  async deleteFlight(id: string, userId: string): Promise<boolean> {
    const existing = this.flights.get(id);
    if (!existing || existing.user_id !== userId) return false;
    
    return this.flights.delete(id);
  }

  // Employer methods
  async getEmployers(userId: string): Promise<Employer[]> {
    return Array.from(this.employers.values())
      .filter(employer => employer.user_id === userId)
      .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  }

  async createEmployer(userId: string, employer: InsertEmployer): Promise<Employer> {
    const id = randomUUID();
    const employerEntry: Employer = { ...employer, id, user_id: userId };
    this.employers.set(id, employerEntry);
    return employerEntry;
  }

  async updateEmployer(id: string, userId: string, employer: Partial<InsertEmployer>): Promise<Employer | undefined> {
    const existing = this.employers.get(id);
    if (!existing || existing.user_id !== userId) return undefined;
    
    const updated = { ...existing, ...employer };
    this.employers.set(id, updated);
    return updated;
  }

  async deleteEmployer(id: string, userId: string): Promise<boolean> {
    const existing = this.employers.get(id);
    if (!existing || existing.user_id !== userId) return false;
    
    return this.employers.delete(id);
  }

  // Education methods
  async getEducation(userId: string): Promise<Education[]> {
    return Array.from(this.education.values())
      .filter(edu => edu.user_id === userId)
      .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  }

  async createEducation(userId: string, education: InsertEducation): Promise<Education> {
    const id = randomUUID();
    const educationEntry: Education = { ...education, id, user_id: userId };
    this.education.set(id, educationEntry);
    return educationEntry;
  }

  async updateEducation(id: string, userId: string, education: Partial<InsertEducation>): Promise<Education | undefined> {
    const existing = this.education.get(id);
    if (!existing || existing.user_id !== userId) return undefined;
    
    const updated = { ...existing, ...education };
    this.education.set(id, updated);
    return updated;
  }

  async deleteEducation(id: string, userId: string): Promise<boolean> {
    const existing = this.education.get(id);
    if (!existing || existing.user_id !== userId) return false;
    
    return this.education.delete(id);
  }

  // Address methods
  async getAddresses(userId: string): Promise<Address[]> {
    return Array.from(this.addresses.values())
      .filter(address => address.user_id === userId)
      .sort((a, b) => new Date(b.from_date).getTime() - new Date(a.from_date).getTime());
  }

  async createAddress(userId: string, address: InsertAddress): Promise<Address> {
    const id = randomUUID();
    const addressEntry: Address = { ...address, id, user_id: userId };
    this.addresses.set(id, addressEntry);
    return addressEntry;
  }

  async updateAddress(id: string, userId: string, address: Partial<InsertAddress>): Promise<Address | undefined> {
    const existing = this.addresses.get(id);
    if (!existing || existing.user_id !== userId) return undefined;
    
    const updated = { ...existing, ...address };
    this.addresses.set(id, updated);
    return updated;
  }

  async deleteAddress(id: string, userId: string): Promise<boolean> {
    const existing = this.addresses.get(id);
    if (!existing || existing.user_id !== userId) return false;
    
    return this.addresses.delete(id);
  }
}

export const storage = new MemStorage();
