import { expect, test } from "./fixtures";
import { getEmails, getLastEmail } from "./emails";
import { registerViaApi, seedSubscription } from "./helpers";
import { E2E_CRON_SECRET } from "./cron";

const DAY_MS = 24 * 60 * 60 * 1000;
const CRON_PATH = "/api/cron/subscription-reminders";

test("the reminder job needs the cron secret", async ({ request }) => {
  expect((await request.get(CRON_PATH)).status()).toBe(401);
  const wrong = await request.get(CRON_PATH, { headers: { authorization: "Bearer nope" } });
  expect(wrong.status()).toBe(401);
});

test("a renewal in 2 days is reminded once, however often the job runs", async ({
  page,
  request,
}) => {
  const user = await registerViaApi(page);
  await getLastEmail(user.email); // the welcome email, so it can't be mistaken for the reminder
  await seedSubscription(user, {
    plan: "premium",
    interval: "month",
    currentPeriodEnd: new Date(Date.now() + 2 * DAY_MS),
  });

  const runJob = () =>
    request.get(CRON_PATH, { headers: { authorization: `Bearer ${E2E_CRON_SECRET}` } });
  expect((await runJob()).status()).toBe(200);
  expect((await runJob()).status()).toBe(200);

  const reminders = (await getEmails(user.email)).filter((email) =>
    email.subject.startsWith("Premium renews on"),
  );
  expect(reminders).toHaveLength(1);
  expect(reminders[0].text).toContain("$9.99 for the month");
});
