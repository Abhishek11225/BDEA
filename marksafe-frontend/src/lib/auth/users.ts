/**
 * PROTOTYPE ONLY: replace with real identity provider and hashed credentials
 * before production. These credentials are intentionally stored in plain text
 * for the demo prototype. In production, use bcrypt/argon2 hashes and an
 * external identity provider (SAML/OIDC SSO).
 */

import type { MockUser } from "./types";

export const MOCK_USERS: readonly MockUser[] = [
  {
    id: "cse_examiner5",
    password: "Cse@2026",
    name: "Dr. Anil Kumar",
    role: "examiner",
    department: "CSE",
    semester: 5,
  },
  {
    id: "mech_examiner5",
    password: "Mech@2026",
    name: "Dr. Rajesh Patel",
    role: "examiner",
    department: "Mechanical",
    semester: 5,
  },
  {
    id: "civil_examiner5",
    password: "Civil@2026",
    name: "Dr. Sunita Verma",
    role: "examiner",
    department: "Civil",
    semester: 5,
  },
] as const;
