import { NextRequest, NextResponse } from "next/server";
import {
  findUserByEmail,
  generateToken,
  updateLastLogin,
} from "@/lib/auth/serverAuth";
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
        { status: 400 }
      );
    }

    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    await updateLastLogin(user._id.toString());

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    const userResponse = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      favorites: user.favorites,
      createdAt: user.createdAt,
      lastLogin: new Date(),
    };

    return NextResponse.json({
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
