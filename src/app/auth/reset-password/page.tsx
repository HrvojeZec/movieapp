import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordView } from "@/views/reset-password/ResetPasswordView";

// The token is a secret: keep it out of the Referer header sent to other sites
export const metadata: Metadata = { title: "Choose a new password", referrer: "no-referrer" };

export default function Page() {
  // The view reads the token from the URL on the client, which requires a Suspense boundary
  return (
    <Suspense>
      <ResetPasswordView />
    </Suspense>
  );
}
