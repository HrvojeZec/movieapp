import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/ui/AuthForm/AuthForm";

export const metadata: Metadata = { title: "Log in" };

export default function Page() {
  return <AuthForm type="login" />;
}
