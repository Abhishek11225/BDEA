/** Shared types for the authentication system. */

export type Department = "CSE" | "Mechanical" | "Civil";

export type Role = "examiner" | "moderator" | "admin";

export interface MockUser {
  id: string;
  password: string;
  name: string;
  role: Role;
  department: Department;
  semester: number;
}

export interface UserSession {
  userId: string;
  name: string;
  role: Role;
  department: Department;
  semester: number;
  exp: number;
}

export interface LoginRequest {
  department: Department;
  userId: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  error?: string;
  session?: Omit<UserSession, "exp">;
}
