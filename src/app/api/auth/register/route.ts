import { NextRequest, NextResponse } from "next/server";
import { generateToken } from "@/features/auth/server/tokens";
import { createUser } from "@/features/auth/server/users";
import { setAuthCookie } from "@/features/auth/server/session";
import { registerSchema } from "@/features/auth/validation";
import { z } from "zod";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  let email: string;
  let password: string;
  let name: string;

  try {
    const requestData = await request.json();

    const validatedData = registerSchema.parse(requestData);
    email = validatedData.email;
    password = validatedData.password;
    name = validatedData.name;
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

    console.error("Registration error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }

  try {
    const user = await createUser(email, password, name);
    const token = generateToken({ userId: user.id, email: user.email, name: user.name });

    const response = NextResponse.json({ user });
    setAuthCookie(response, token);
    return response;
  } catch (error) {
    if (error instanceof Error && error.message === "User already exists") {
      return NextResponse.json({ message: "User already exists" }, { status: 409 });
    }

    console.error("Registration error:", error);

    if (error instanceof mongoose.Error.ValidationError) {
      const mongoErrors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));

      return NextResponse.json(
        {
          message: "Database validation failed",
          errors: mongoErrors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
