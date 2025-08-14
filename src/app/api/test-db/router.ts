import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectDB();

    const dbName = mongoose.connection.name;
    const readyState = mongoose.connection.readyState;
    const host = mongoose.connection.host;

    return NextResponse.json({
      message: "Database connected successfully!",
      database: dbName,
      status: readyState === 1 ? "Connected" : "Disconnected",
      host: host,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      {
        error: "Database connection failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
