import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { LoginRequest, LoginResponse } from "@/lib/auth/types";
import { MOCK_USERS } from "@/lib/auth/users";
import { createSession } from "@/lib/auth/session";

export async function POST(request: NextRequest): Promise<NextResponse<LoginResponse>> {
  try {
    const body = (await request.json()) as LoginRequest;
    const { department, userId, password } = body;

    if (!department || !userId || !password) {
      return NextResponse.json(
        { success: false, error: "All fields are required." },
        { status: 400 },
      );
    }

    // Validate all three fields together — never reveal which part was wrong
    const user = MOCK_USERS.find(
      (u) =>
        u.id === userId &&
        u.password === password &&
        u.department === department,
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Incorrect ID or password for the selected department.",
        },
        { status: 401 },
      );
    }

    const sessionPayload = {
      userId: user.id,
      name: user.name,
      role: user.role,
      department: user.department,
      semester: user.semester,
    };

    await createSession(sessionPayload);

    return NextResponse.json({
      success: true,
      session: sessionPayload,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
