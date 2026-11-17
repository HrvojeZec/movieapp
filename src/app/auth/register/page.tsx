import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/ui/AuthForm/AuthForm";

export const metadata: Metadata = { title: "Create account" };

export default function Page() {
  return <AuthForm type="register" />;
}
