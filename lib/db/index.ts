import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as typeof globalThis & {
  postgresClient?: ReturnType<typeof postgres>;
  drizzleDb?: ReturnType<typeof createDb>;
};

function createDb() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const client =
    globalForDb.postgresClient ??
    postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 30,
      max_lifetime: 60 * 30,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.postgresClient = client;
  }

  return drizzle(client, { schema });
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
