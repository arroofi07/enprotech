import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as typeof globalThis & {
  postgresClient?: ReturnType<typeof postgres>;
  drizzleDb?: ReturnType<typeof createDb>;
};

/**
 * The raw postgres.js client backing `db`. Cached globally so that callers
 * needing driver features drizzle does not expose — `LISTEN`/`NOTIFY`, see
 * lib/infrastructure/notifications/notification-events.ts — share the one pool
 * instead of opening a second.
 */
export function getPostgresClient(): ReturnType<typeof postgres> {
  if (globalForDb.postgresClient) {
    return globalForDb.postgresClient;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  globalForDb.postgresClient = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 30,
    max_lifetime: 60 * 30,
  });

  return globalForDb.postgresClient;
}

function createDb() {
  return drizzle(getPostgresClient(), { schema });
}

// Lazily connects on first use instead of at module evaluation, so routes
// that import `db` can still be loaded during `next build` page-data
// collection, which runs without DATABASE_URL set (see Dockerfile).
export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_target, prop, receiver) {
    if (!globalForDb.drizzleDb) {
      globalForDb.drizzleDb = createDb();
    }
    return Reflect.get(globalForDb.drizzleDb, prop, receiver);
  },
});

export type Database = ReturnType<typeof createDb>;
