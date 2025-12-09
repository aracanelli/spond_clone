import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should display the landing page", async ({ page }) => {
    await page.goto("/");

    // Check for main heading
    await expect(page.locator("h1")).toContainText("Coordinate Your Groups");

    // Check for CTA buttons
    await expect(page.getByRole("link", { name: /start for free/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
  });

  test("should navigate to sign up page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /start for free/i }).first().click();

    await expect(page).toHaveURL(/sign-up/);
  });

  test("should navigate to sign in page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /sign in/i }).first().click();

    await expect(page).toHaveURL(/sign-in/);
  });

  test("should display features section", async ({ page }) => {
    await page.goto("/");

    // Check for feature cards
    await expect(page.getByText("Group Management")).toBeVisible();
    await expect(page.getByText("Event Coordination")).toBeVisible();
    await expect(page.getByText("Free Notifications")).toBeVisible();
    await expect(page.getByText("Mobile Ready")).toBeVisible();
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Check that main content is visible
    await expect(page.locator("h1")).toBeVisible();
    
    // Check that buttons stack on mobile
    const ctaButtons = page.getByRole("link", { name: /start for free|sign in/i });
    await expect(ctaButtons.first()).toBeVisible();
  });
});

test.describe("RSVP Confirmation Page", () => {
  test("should display confirmation for yes response", async ({ page }) => {
    await page.goto("/rsvp/confirm?response=yes&title=Test%20Event&event=123");

    await expect(page.getByText("You're Going!")).toBeVisible();
    await expect(page.getByText(/Test Event/)).toBeVisible();
  });

  test("should display confirmation for no response", async ({ page }) => {
    await page.goto("/rsvp/confirm?response=no&title=Test%20Event&event=123");

    await expect(page.getByText("RSVP Updated")).toBeVisible();
    await expect(page.getByText(/Test Event/)).toBeVisible();
  });
});





