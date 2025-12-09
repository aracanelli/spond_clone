import { test, expect } from '@playwright/test';

test('settings preferences update', async ({ page }) => {
    // Capture browser console logs
    page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));

    // Go to settings
    await page.goto('http://localhost:3000/settings');

    // Login if needed
    await page.waitForTimeout(2000); // Wait for load

    // Check if redirected to sign-in
    if (page.url().includes('sign-in')) {
        await page.getByPlaceholder('Enter your email address').fill('test-admin@spond-test.com');
        await page.getByRole('button', { name: 'Continue', exact: true }).click();
        await page.getByPlaceholder('Enter your password').fill('TestPassword123!111111');
        await page.getByRole('button', { name: 'Continue', exact: true }).click();
        await page.waitForURL('**/settings', { timeout: 30000 });
    }

    // Handle welcome modal
    const skipBtn = page.getByRole('button', { name: 'Skip for now' });
    if (await skipBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await skipBtn.click();
    }

    // Locate the Email Notifications switch
    const emailSwitch = page.locator('button[role="switch"]').nth(0);

    // Get initial state
    const initialState = await emailSwitch.getAttribute('aria-checked');
    console.log(`Initial Email Switch State: ${initialState}`);

    // Toggle it
    await emailSwitch.click();

    // Check for either success or error toast
    const successToast = page.locator("text=Settings Updated");
    // Only check for "Error" keyword, as description might vary
    const errorToast = page.locator("text=Error");

    // Wait for either or timeout
    try {
        await Promise.race([
            successToast.waitFor({ state: 'visible', timeout: 5000 }),
            errorToast.waitFor({ state: 'visible', timeout: 5000 })
        ]);
        console.log("Toast appeared.");
    } catch (e) {
        console.log("No toast appeared within timeout.");
    }

    // Wait a bit
    await page.waitForTimeout(2000);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Handle welcome modal again if it appears
    if (await skipBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await skipBtn.click();
    }

    // Verify state persisted
    const newState = await emailSwitch.getAttribute('aria-checked');
    console.log(`New Email Switch State: ${newState}`);

    expect(newState).not.toBe(initialState);
});
