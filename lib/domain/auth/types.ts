export type UserRole = "admin" | "trainer" | "student";
export type UserStatus = "pending" | "active" | "inactive";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
};

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
};

export function toSessionUser(payload: SessionPayload): SessionUser {
  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    status: payload.status,
  };
}
