import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import type { Department } from "@/lib/auth/types";
import {
  HOME_DATA,
  DASHBOARD_DATA,
  MODERATION_DATA,
  INTAKE_DATA,
  AUDIT_DATA,
  RUBRIC_DATA,
  EVALUATION_CONTEXT,
  DEPARTMENT_SUBJECTS,
} from "@/lib/data/department-data";

/**
 * Protected data API. Reads department from the session cookie and returns
 * only the data for the logged-in user's department.
 *
 * GET /api/data/home
 * GET /api/data/dashboard
 * GET /api/data/moderation
 * GET /api/data/intake
 * GET /api/data/audit
 * GET /api/data/rubric
 * GET /api/data/evaluation
 * GET /api/data/subjects
 *
 * Optionally accepts ?department= query param for cross-check — if it doesn't
 * match session.department, returns 403.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
): Promise<NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const { slug } = await params;
  const resource = slug[0];
  const department = session.department as Department;

  // Cross-department access check: if a department query param is passed,
  // it must match the session department
  const requestedDept = request.nextUrl.searchParams.get("department");
  if (requestedDept && requestedDept !== department) {
    return NextResponse.json(
      { error: "Access denied: you cannot access another department's data." },
      { status: 403 },
    );
  }

  switch (resource) {
    case "home":
      return NextResponse.json({ data: HOME_DATA[department] });
    case "dashboard":
      return NextResponse.json({ data: DASHBOARD_DATA[department] });
    case "moderation":
      return NextResponse.json({ data: MODERATION_DATA[department] });
    case "intake":
      return NextResponse.json({ data: INTAKE_DATA[department] });
    case "audit":
      return NextResponse.json({ data: AUDIT_DATA[department] });
    case "rubric":
      return NextResponse.json({ data: RUBRIC_DATA[department] });
    case "evaluation":
      return NextResponse.json({ data: EVALUATION_CONTEXT[department] });
    case "subjects":
      return NextResponse.json({ data: DEPARTMENT_SUBJECTS[department] });
    default:
      return NextResponse.json({ error: "Unknown resource." }, { status: 404 });
  }
}
