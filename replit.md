# Personal Data Manager

## Overview

This is a full-stack personal data management application that allows users to store, manage, and export their personal and travel history data. The application features a modern, responsive UI with light/dark theme support and integrates with the AviationStack API for automatic flight data population. Users can manage six main data categories: travel history, flight records, employment history, education records, address history, and personal information. The application includes comprehensive CRUD operations, search and filtering capabilities, and data export functionality in multiple formats (PDF, CSV, Excel, JSON).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with React 18 and TypeScript, utilizing a component-based architecture with modern React patterns. The UI framework is shadcn/ui components built on top of Radix UI primitives and styled with Tailwind CSS. The application uses Wouter for client-side routing, providing a lightweight alternative to React Router. State management is handled through React Context for global state (authentication and theme) and TanStack Query for server state management and caching. The theme system supports light/dark mode with preferences persisted in localStorage.

### Backend Architecture
The server runs on Node.js with Express.js using ESM modules for modern JavaScript support. The API follows RESTful conventions with JWT-based authentication for secure access. The backend implements a clean separation of concerns with dedicated service layers for authentication, data export, and external API integrations. Route handlers are organized in a single routes file with proper middleware for authentication and error handling.

### Data Storage
The application uses Drizzle ORM with PostgreSQL as the primary database. The database schema includes seven main tables: users, personal_info, travel_history, flights, employers, education, and addresses. All tables use UUID primary keys and implement proper foreign key relationships with cascade deletes. The storage layer includes an interface-based design with both in-memory and database implementations, allowing for flexible data persistence strategies.

### Authentication & Authorization
Authentication is implemented using JWT tokens with bcryptjs for password hashing. The system includes user registration and login endpoints with proper password validation. Authorization is handled through middleware that validates JWT tokens on protected routes. The frontend maintains authentication state through React Context and automatically includes tokens in API requests.

### Build & Development
The application uses Vite as the build tool with React plugin for fast development and hot module replacement. TypeScript configuration supports both client and server code with proper path aliases for clean imports. The build process generates a static frontend and a bundled Node.js server using esbuild for production deployment.

## External Dependencies

### Database & ORM
- **PostgreSQL**: Primary database using Neon serverless PostgreSQL
- **Drizzle ORM**: Type-safe ORM with migrations support via drizzle-kit
- **@neondatabase/serverless**: Serverless PostgreSQL client for Neon

### UI & Styling
- **Radix UI**: Comprehensive collection of low-level UI primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **shadcn/ui**: Pre-built component library based on Radix UI and Tailwind
- **Lucide React**: Modern icon library for consistent iconography

### State Management & API
- **TanStack Query**: Powerful data synchronization and caching for server state
- **React Hook Form**: Performant forms library with minimal re-renders
- **Zod**: Schema validation library integrated with Drizzle for type safety

### Authentication & Security
- **JWT (jsonwebtoken)**: Token-based authentication for stateless sessions
- **bcryptjs**: Password hashing library for secure password storage

### External APIs
- **AviationStack API**: Flight data service for automatic flight information population
- **Data Export Libraries**: jsPDF for PDF generation, xlsx for Excel/CSV export

### Development Tools
- **Vite**: Fast build tool with React plugin and development server
- **TypeScript**: Static type checking for both frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment plugins for Replit platform