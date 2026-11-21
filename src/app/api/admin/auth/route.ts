import { NextRequest, NextResponse } from "next/server";
import { AdminAuthSchema } from "@/lib/validation";
import {
  verifyAdminSecret,
  generateAdminSessionToken,
  ADMIN_COOKIE_OPTIONS,
  isCurrentAdminAuthenticated,
} from "@/lib/auth";

export async function GET() {
  const authenticated = await isCurrentAdminAuthenticated();
  return NextResponse.json({ authenticated });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = AdminAuthSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 }
      );
    }

    const isValid = verifyAdminSecret(validated.data.secret);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid administrative secret key." },
        { status: 401 }
      );
    }

    const token = generateAdminSessionToken();
    const response = NextResponse.json({
      success: true,
      message: "Admin authentication successful",
    });

    response.cookies.set({
      name: ADMIN_COOKIE_OPTIONS.name,
      value: token,
      httpOnly: ADMIN_COOKIE_OPTIONS.httpOnly,
      secure: ADMIN_COOKIE_OPTIONS.secure,
      sameSite: ADMIN_COOKIE_OPTIONS.sameSite,
      path: ADMIN_COOKIE_OPTIONS.path,
      maxAge: ADMIN_COOKIE_OPTIONS.maxAge,
    });

    return response;
  } catch (error) {
    console.error("Admin auth error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication system error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  response.cookies.delete(ADMIN_COOKIE_OPTIONS.name);
  return response;
}
