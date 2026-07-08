import "dotenv/config";

import { hashPassword } from "@/lib/infrastructure/auth/password-hasher";
import {
  createUser,
  findUserByEmail,
} from "@/lib/infrastructure/db/repositories/user-repository";

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set");
  }

  const existing = await findUserByEmail(email);

  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    return;
  }

  const passwordHash = await hashPassword(password);

  const admin = await createUser({
    name: "Administrator",
    email,
    passwordHash,
    role: "admin",
    status: "active",
  });

  console.log(`Admin user created: ${admin.email}`);
}

seedAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
