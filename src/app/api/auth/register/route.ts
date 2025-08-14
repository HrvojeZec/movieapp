import { NextRequest, NextResponse } from "next/server";
import { createUser, generateToken } from "@/lib/auth/serverAuth";
import { registerSchema } from "@/lib/validation/validation";
import { z } from "zod";

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
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }

  try {
    const user = await createUser(email, password, name);
    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return NextResponse.json({
      token,
      user,
    });
  } catch (error: any) {
    if (error.message === "User already exists") {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    console.error("Registration error:", error);

    if (error.name === "ValidationError" && error.errors) {
      const mongoErrors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message,
      }));

      return NextResponse.json(
        {
          message: "Database validation failed",
          errors: mongoErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
