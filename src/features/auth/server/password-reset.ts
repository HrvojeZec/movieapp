import { createHash, randomBytes } from "node:crypto";
import connectDB from "@/server/db/mongodb";
import User from "@/server/models/User";
import { getAppUrl } from "@/server/app-url";
import { sendEmail } from "@/server/email/send";
import { RouteError } from "@/server/http/route-error";
import { HTTP_STATUS } from "@/shared/lib/http-status";
import { ROUTES } from "@/shared/routes";
import { PASSWORD_RESET_TOKEN_BYTES, PASSWORD_RESET_TTL_MS } from "@/entities/user/constants";
import { getPasswordChangedNotification } from "@/entities/notification/lib/account-events";
import { buildPasswordResetEmail } from "@/entities/notification/server/emails";
import { notifyUser } from "@/entities/notification/server/notify";

// A leaked database must not give out working reset links, so only the hash is stored
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/**
 * Emails a one-time reset link if an account uses this address. Callers answer the same way
 * either way, so the form can't be used to find out who has an account.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  await connectDB();
  const user = await User.findOne({ email, isActive: true });
  if (!user) return;

  const token = randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString("hex");
  await User.updateOne(
    { _id: user._id },
    {
      passwordResetTokenHash: hashToken(token),
      passwordResetExpires: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
    },
  );
  // Never throws; if the email doesn't go out, the user can simply ask again
  await sendEmail(buildPasswordResetEmail(user, `${getAppUrl()}${ROUTES.resetPassword(token)}`));
}

/**
 * Sets a new password for the account the link belongs to; the link stops working at once.
 * Returns the account's ID so the caller can confirm the change (see notifyPasswordChanged).
 */
export async function resetPassword(token: string, password: string): Promise<string> {
  await connectDB();
  // Claims and clears the token in one step, so two submissions of the same link can't both win
  const user = await User.findOneAndUpdate(
    { passwordResetTokenHash: hashToken(token), passwordResetExpires: { $gt: new Date() } },
    { $unset: { passwordResetTokenHash: 1, passwordResetExpires: 1 } },
    { returnDocument: "after" },
  );
  if (!user) {
    throw new RouteError(HTTP_STATUS.BAD_REQUEST, "This reset link is invalid or has expired");
  }

  user.password = password; // hashed by the model's pre-save hook
  await user.save();
  return user._id.toString();
}

/**
 * Tells the owner their password changed (bell and email), so an unexpected change gets noticed.
 * Never throws: the password is already changed either way.
 */
export async function notifyPasswordChanged(userId: string): Promise<void> {
  try {
    await notifyUser(userId, getPasswordChangedNotification(new Date()), { email: true });
  } catch (error) {
    console.error("Password change notification failed:", error);
  }
}
