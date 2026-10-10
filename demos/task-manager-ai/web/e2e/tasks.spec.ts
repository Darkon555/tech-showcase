import { expect, test } from "@playwright/test";

// Covers AC-1 (create a task) and AC-2 (toggle done).
test("create a task and toggle it done", async ({ page }) => {
  await page.goto("/");

  const title = `E2E task ${Date.now()}`;
  await page.getByLabel("Task title").fill(title);
  await page.getByRole("button", { name: "Add" }).click();

  const row = page.locator(".task", { hasText: title });
  await expect(row).toBeVisible();

  // AC-2: toggling the checkbox marks it done
  await row.getByRole("checkbox").check();
  await expect(row).toHaveClass(/done/);
});
