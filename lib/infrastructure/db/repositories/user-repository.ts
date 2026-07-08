import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import type { UserRole, UserStatus } from "@/lib/domain/auth/types";

export type CreateUserInput = {
  name: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
  status?: UserStatus;
};

export type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  status: UserStatus;
};

function mapUser(record: typeof users.$inferSelect): UserRecord {
  return {
    id: record.id,
    email: record.email,
    passwordHash: record.passwordHash,
    name: record.name,
    role: record.role,
    status: record.status,
  };
}

export async function findUserByEmail(
  email: string,
): Promise<UserRecord | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  return user ? mapUser(user) : null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return user ? mapUser(user) : null;
}

export async function createUser(input: CreateUserInput): Promise<UserRecord> {
  const [user] = await db
    .insert(users)
    .values({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      role: input.role ?? "student",
      status: input.status ?? "pending",
    })
    .returning();

  return mapUser(user);
}
