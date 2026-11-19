/**
 * The free trial is for a first subscription only: not after a trial, and not for anyone who
 * already subscribed (including subscriptions from before trials existed, which never set
 * hasUsedTrial).
 */
export const isTrialAvailable = (user: {
  hasUsedTrial?: boolean;
  subscriptionId?: string | null;
}): boolean => !user.hasUsedTrial && !user.subscriptionId;
