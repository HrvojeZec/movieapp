// Lets the tests call the scheduled jobs on the E2E server (playwright.config passes it as
// CRON_SECRET); not a real secret
export const E2E_CRON_SECRET = "e2e-cron-secret";
