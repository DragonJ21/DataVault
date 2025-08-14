import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const personal_info = pgTable("personal_info", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  full_name: text("full_name"),
  passport_number: text("passport_number"),
  dob: date("dob"),
});

export const travel_history = pgTable("travel_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  destination: text("destination").notNull(),
  notes: text("notes"),
});

export const flights = pgTable("flights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  flight_number: text("flight_number").notNull(),
  airline: text("airline").notNull(),
  departure_airport: text("departure_airport").notNull(),
  arrival_airport: text("arrival_airport").notNull(),
  departure_time: timestamp("departure_time"),
  arrival_time: timestamp("arrival_time"),
  gate: text("gate"),
  status: text("status"),
});

export const employers = pgTable("employers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  company_name: text("company_name").notNull(),
  role: text("role").notNull(),
  start_date: date("start_date").notNull(),
  end_date: date("end_date"),
  notes: text("notes"),
});

export const education = pgTable("education", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  institution: text("institution").notNull(),
  degree: text("degree").notNull(),
  start_date: date("start_date").notNull(),
  end_date: date("end_date"),
});

export const addresses = pgTable("addresses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state"),
  country: text("country").notNull(),
  from_date: date("from_date").notNull(),
  to_date: date("to_date"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
});

export const insertPersonalInfoSchema = createInsertSchema(personal_info).omit({
  id: true,
  user_id: true,
});

export const insertTravelHistorySchema = createInsertSchema(travel_history).omit({
  id: true,
  user_id: true,
});

export const insertFlightSchema = createInsertSchema(flights).omit({
  id: true,
  user_id: true,
});

export const insertEmployerSchema = createInsertSchema(employers).omit({
  id: true,
  user_id: true,
});

export const insertEducationSchema = createInsertSchema(education).omit({
  id: true,
  user_id: true,
});

export const insertAddressSchema = createInsertSchema(addresses).omit({
  id: true,
  user_id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type PersonalInfo = typeof personal_info.$inferSelect;
export type InsertPersonalInfo = z.infer<typeof insertPersonalInfoSchema>;
export type TravelHistory = typeof travel_history.$inferSelect;
export type InsertTravelHistory = z.infer<typeof insertTravelHistorySchema>;
export type Flight = typeof flights.$inferSelect;
export type InsertFlight = z.infer<typeof insertFlightSchema>;
export type Employer = typeof employers.$inferSelect;
export type InsertEmployer = z.infer<typeof insertEmployerSchema>;
export type Education = typeof education.$inferSelect;
export type InsertEducation = z.infer<typeof insertEducationSchema>;
export type Address = typeof addresses.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;
