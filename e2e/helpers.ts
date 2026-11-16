import { expect, type Page } from "@playwright/test";

// Every test user matches this pattern, so global teardown can delete exactly these users.
export const E2E_EMAIL_PATTERN = /^e2e-[a-z0-9-]+@example\.com$/;

export interface TestUser {
  name: string;
  email: string;
  password: string;
}

export function createTestUser(): TestUser {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return { name: "Test User", email: `e2e-${id}@example.com`, password: "E2eTest123" };
}

/** Registers through the API; the auth cookie lands in the page's browser context. */
export async function registerViaApi(page: Page, user = createTestUser()): Promise<TestUser> {
  const response = await page.request.post("/api/auth/register", { data: user });
  expect(response.ok(), await response.text()).toBeTruthy();
  return user;
}
