import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete registration flow', async ({ page }) => {
    // Navigate to register page
    await page.goto('/register');

    // Verify we're on the registration page
    await expect(
      page.getByRole('heading', { name: 'Create your account' })
    ).toBeVisible();

    // Fill in registration form
    await page.getByPlaceholder('you@example.com').fill(testEmail);
    await page.getByPlaceholder('••••••••').first().fill(testPassword);
    await page.getByPlaceholder('••••••••').nth(1).fill(testPassword);

    // Submit registration
    await page.getByRole('button', { name: 'Create account' }).click();

    // Wait for successful registration (redirects to home or dashboard)
    await page.waitForURL((url) => url.pathname !== '/register', {
      timeout: 5000
    });
  });

  test('should complete login flow', async ({ page }) => {
    // First, register a user
    await page.goto('/register');
    await page.getByPlaceholder('you@example.com').fill(testEmail);
    await page.getByPlaceholder('••••••••').first().fill(testPassword);
    await page.getByPlaceholder('••••••••').nth(1).fill(testPassword);
    await page.getByRole('button', { name: 'Create account' }).click();
    await page.waitForURL((url) => url.pathname !== '/register', {
      timeout: 5000
    });

    // Logout (if logout exists)
    // For now, we'll clear cookies to simulate logout
    await page.context().clearCookies();

    // Navigate to login page
    await page.goto('/login');

    // Verify we're on the login page
    await expect(
      page.getByRole('heading', { name: 'Sign in to your account' })
    ).toBeVisible();

    // Fill in login form
    await page.getByPlaceholder('you@example.com').fill(testEmail);
    await page.getByPlaceholder('••••••••').fill(testPassword);

    // Submit login
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Wait for successful login (redirects away from login page)
    await page.waitForURL((url) => url.pathname !== '/login', {
      timeout: 5000
    });
  });

  test('should complete full registration, login, and logout flow', async ({
    page
  }) => {
    // Step 1: Register
    await page.goto('/register');
    await expect(
      page.getByRole('heading', { name: 'Create your account' })
    ).toBeVisible();

    await page.getByPlaceholder('you@example.com').fill(testEmail);
    await page.getByPlaceholder('••••••••').first().fill(testPassword);
    await page.getByPlaceholder('••••••••').nth(1).fill(testPassword);

    await page.getByRole('button', { name: 'Create account' }).click();
    await page.waitForURL((url) => url.pathname !== '/register', {
      timeout: 5000
    });

    // Step 2: Logout (using cookie clearing for now)
    await page.context().clearCookies();

    // Step 3: Login
    await page.goto('/login');
    await expect(
      page.getByRole('heading', { name: 'Sign in to your account' })
    ).toBeVisible();

    await page.getByPlaceholder('you@example.com').fill(testEmail);
    await page.getByPlaceholder('••••••••').fill(testPassword);

    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL((url) => url.pathname !== '/login', {
      timeout: 5000
    });

    // Verify successful login (should not be on login or register pages)
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
    expect(currentUrl).not.toContain('/register');
  });

  test('should show validation errors for invalid registration', async ({
    page
  }) => {
    await page.goto('/register');

    // Try to submit with empty fields
    const submitButton = page.getByRole('button', { name: 'Create account' });
    await expect(submitButton).toBeDisabled();

    // Fill only email
    await page.getByPlaceholder('you@example.com').fill('invalid-email');

    // Button should still be disabled with invalid input
    await expect(submitButton).toBeDisabled();
  });

  test('should show validation errors for invalid login', async ({ page }) => {
    await page.goto('/login');

    // Fill in invalid credentials
    await page
      .getByPlaceholder('you@example.com')
      .fill('nonexistent@example.com');
    await page.getByPlaceholder('••••••••').fill('wrongpassword');

    // Submit login
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Should remain on login page due to invalid credentials
    await expect(page).toHaveURL(/.*\/login/);
  });
});
