import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure the connection pool differently for production vs development
const poolConfig = process.env.NODE_ENV === 'production' 
  ? { 
      connectionString: process.env.DATABASE_URL,
      max: 20,                 // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
      connectionTimeoutMillis: 2000, // How long to wait for a connection
      ssl: true                // Enable SSL for production connections
    }
  : { 
      connectionString: process.env.DATABASE_URL,
      max: 10 // Fewer connections for development
    };

// Log pool configuration at startup (without sensitive data)
console.log(`Database pool configured for ${process.env.NODE_ENV} environment with max ${poolConfig.max} connections`);

export const pool = new Pool(poolConfig);
export const db = drizzle({ client: pool, schema });
