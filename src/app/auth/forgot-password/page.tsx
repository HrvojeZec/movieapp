import type { Metadata } from "next";
import { ForgotPasswordView } from "@/views/forgot-password/ForgotPasswordView";

export const metadata: Metadata = { title: "Forgot password" };

export default function Page() {
  return <ForgotPasswordView />;
}
