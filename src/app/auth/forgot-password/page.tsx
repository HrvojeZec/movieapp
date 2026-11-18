import type { Metadata } from "next";
import { ForgotPasswordView } from "@/features/auth/views/ForgotPasswordView";

export const metadata: Metadata = { title: "Forgot password" };

export default function Page() {
  return <ForgotPasswordView />;
}
