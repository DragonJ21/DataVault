import { type User, type DatabaseUser, type PersonalInfo, type InsertPersonalInfo, type TravelHistory, type InsertTravelHistory, type Flight, type InsertFlight, type Employer, type InsertEmployer, type Education, type InsertEducation, type Address, type InsertAddress, users, personal_info, travel_history, flights, employers, education, addresses } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: DatabaseUser): Promise<User>;

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

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: DatabaseUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Personal info methods
  async getPersonalInfo(userId: string): Promise<PersonalInfo | undefined> {
    const [info] = await db.select().from(personal_info).where(eq(personal_info.user_id, userId));
    return info || undefined;
  }

  async createPersonalInfo(userId: string, info: InsertPersonalInfo): Promise<PersonalInfo> {
    const [personalInfo] = await db
      .insert(personal_info)
      .values({ ...info, user_id: userId })
      .returning();
    return personalInfo;
  }

  async updatePersonalInfo(id: string, userId: string, info: Partial<InsertPersonalInfo>): Promise<PersonalInfo | undefined> {
    const [updated] = await db
      .update(personal_info)
      .set(info)
      .where(and(eq(personal_info.id, id), eq(personal_info.user_id, userId)))
      .returning();
    return updated || undefined;
  }

  async deletePersonalInfo(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(personal_info)
      .where(and(eq(personal_info.id, id), eq(personal_info.user_id, userId)));
    return (result.rowCount || 0) > 0;
  }

  // Travel history methods
  async getTravelHistory(userId: string): Promise<TravelHistory[]> {
    return await db
      .select()
      .from(travel_history)
      .where(eq(travel_history.user_id, userId))
      .orderBy(desc(travel_history.date));
  }

  async createTravelEntry(userId: string, entry: InsertTravelHistory): Promise<TravelHistory> {
    const [travelEntry] = await db
      .insert(travel_history)
      .values({ ...entry, user_id: userId })
      .returning();
    return travelEntry;
  }

  async updateTravelEntry(id: string, userId: string, entry: Partial<InsertTravelHistory>): Promise<TravelHistory | undefined> {
    const [updated] = await db
      .update(travel_history)
      .set(entry)
      .where(and(eq(travel_history.id, id), eq(travel_history.user_id, userId)))
      .returning();
    return updated || undefined;
  }

  async deleteTravelEntry(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(travel_history)
      .where(and(eq(travel_history.id, id), eq(travel_history.user_id, userId)));
    return (result.rowCount || 0) > 0;
  }

  // Flight methods
  async getFlights(userId: string): Promise<Flight[]> {
    return await db
      .select()
      .from(flights)
      .where(eq(flights.user_id, userId))
      .orderBy(desc(flights.departure_time));
  }

  async createFlight(userId: string, flight: InsertFlight): Promise<Flight> {
    const [flightEntry] = await db
      .insert(flights)
      .values({ ...flight, user_id: userId })
      .returning();
    return flightEntry;
  }

  async updateFlight(id: string, userId: string, flight: Partial<InsertFlight>): Promise<Flight | undefined> {
    const [updated] = await db
      .update(flights)
      .set(flight)
      .where(and(eq(flights.id, id), eq(flights.user_id, userId)))
      .returning();
    return updated || undefined;
  }

  async deleteFlight(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(flights)
      .where(and(eq(flights.id, id), eq(flights.user_id, userId)));
    return (result.rowCount || 0) > 0;
  }

  // Employer methods
  async getEmployers(userId: string): Promise<Employer[]> {
    return await db
      .select()
      .from(employers)
      .where(eq(employers.user_id, userId))
      .orderBy(desc(employers.start_date));
  }

  async createEmployer(userId: string, employer: InsertEmployer): Promise<Employer> {
    const [employerEntry] = await db
      .insert(employers)
      .values({ ...employer, user_id: userId })
      .returning();
    return employerEntry;
  }

  async updateEmployer(id: string, userId: string, employer: Partial<InsertEmployer>): Promise<Employer | undefined> {
    const [updated] = await db
      .update(employers)
      .set(employer)
      .where(and(eq(employers.id, id), eq(employers.user_id, userId)))
      .returning();
    return updated || undefined;
  }

  async deleteEmployer(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(employers)
      .where(and(eq(employers.id, id), eq(employers.user_id, userId)));
    return (result.rowCount || 0) > 0;
  }

  // Education methods
  async getEducation(userId: string): Promise<Education[]> {
    return await db
      .select()
      .from(education)
      .where(eq(education.user_id, userId))
      .orderBy(desc(education.start_date));
  }

  async createEducation(userId: string, educationData: InsertEducation): Promise<Education> {
    const [educationEntry] = await db
      .insert(education)
      .values({ ...educationData, user_id: userId })
      .returning();
    return educationEntry;
  }

  async updateEducation(id: string, userId: string, educationData: Partial<InsertEducation>): Promise<Education | undefined> {
    const [updated] = await db
      .update(education)
      .set(educationData)
      .where(and(eq(education.id, id), eq(education.user_id, userId)))
      .returning();
    return updated || undefined;
  }

  async deleteEducation(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(education)
      .where(and(eq(education.id, id), eq(education.user_id, userId)));
    return (result.rowCount || 0) > 0;
  }

  // Address methods
  async getAddresses(userId: string): Promise<Address[]> {
    return await db
      .select()
      .from(addresses)
      .where(eq(addresses.user_id, userId))
      .orderBy(desc(addresses.from_date));
  }

  async createAddress(userId: string, address: InsertAddress): Promise<Address> {
    const [addressEntry] = await db
      .insert(addresses)
      .values({ ...address, user_id: userId })
      .returning();
    return addressEntry;
  }

  async updateAddress(id: string, userId: string, address: Partial<InsertAddress>): Promise<Address | undefined> {
    const [updated] = await db
      .update(addresses)
      .set(address)
      .where(and(eq(addresses.id, id), eq(addresses.user_id, userId)))
      .returning();
    return updated || undefined;
  }

  async deleteAddress(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(addresses)
      .where(and(eq(addresses.id, id), eq(addresses.user_id, userId)));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
