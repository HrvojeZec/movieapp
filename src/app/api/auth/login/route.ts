import { NextRequest, NextResponse } from "next/server";
import {
  findUserByEmail,
  findUserById,
  generateToken,
  updateLastLogin,
} from "@/lib/auth/serverAuth";
import { setAuthCookie } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/validation";
import { z } from "zod";

export async function POST(request: NextRequest) {
  let email: string;
  let password: string;

  try {
    const requestData = await request.json();

    const validatedData = loginSchema.parse(requestData);
    email = validatedData.email;
    password = validatedData.password;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return NextResponse.json(
        {
          message: "Validation failed",
          errors,
        },
        { status: 400 },
      );
    }

    console.error("Login error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    await updateLastLogin(user._id.toString());

    const userId = user._id.toString();
    const token = generateToken({ userId, email: user.email, name: user.name });

    // Same shape as /api/user/profile, so subscription details are available right after login.
    const response = NextResponse.json({ user: await findUserById(userId) });
    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
