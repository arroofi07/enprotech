import {
  and,
  count,
  desc,
  eq,
  ilike,
  or,
  type SQL,
} from "drizzle-orm";

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

export type PublicUserRecord = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type ListUsersQuery = {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  page: number;
  pageSize: number;
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

const publicUserColumns = {
  id: users.id,
  email: users.email,
  name: users.name,
  role: users.role,
  status: users.status,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

function buildListFilters(query: ListUsersQuery): SQL | undefined {
  const conditions: SQL[] = [];

  if (query.role) {
    conditions.push(eq(users.role, query.role));
  }

  if (query.status) {
    conditions.push(eq(users.status, query.status));
  }

  if (query.search?.trim()) {
    const term = `%${query.search.trim()}%`;
    const searchCondition = or(
      ilike(users.name, term),
      ilike(users.email, term),
    );

    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (conditions.length === 0) {
    return undefined;
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return and(...conditions);
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

export async function findPublicUserById(
  id: string,
): Promise<PublicUserRecord | null> {
  const [user] = await db
    .select(publicUserColumns)
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return user ?? null;
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

export async function listUsers(
  query: ListUsersQuery,
): Promise<{ items: PublicUserRecord[]; total: number }> {
  const where = buildListFilters(query);
  const offset = (query.page - 1) * query.pageSize;

  const [items, totalResult] = await Promise.all([
    db
      .select(publicUserColumns)
      .from(users)
      .where(where)
      .orderBy(desc(users.createdAt))
      .limit(query.pageSize)
      .offset(offset),
    db.select({ value: count() }).from(users).where(where),
  ]);

  return {
    items,
    total: totalResult[0]?.value ?? 0,
  };
}

export async function updateUserRole(
  id: string,
  role: UserRole,
): Promise<PublicUserRecord | null> {
  const [user] = await db
    .update(users)
    .set({ role })
    .where(eq(users.id, id))
    .returning(publicUserColumns);

  return user ?? null;
}

export async function updateUserStatus(
  id: string,
  status: UserStatus,
): Promise<PublicUserRecord | null> {
  const [user] = await db
    .update(users)
    .set({ status })
    .where(eq(users.id, id))
    .returning(publicUserColumns);

  return user ?? null;
}

export async function countActiveAdmins(): Promise<number> {
  const [result] = await db
    .select({ value: count() })
    .from(users)
    .where(and(eq(users.role, "admin"), eq(users.status, "active")));

  return result?.value ?? 0;
}
