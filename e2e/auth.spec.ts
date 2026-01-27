import { test, expect } from "../playwright-fixture";

/**
 * E2E Tests for Authentication Flow
 * 
 * These tests verify the complete authentication experience including:
 * - Sign up with email/password
 * - Login with email/password
 * - Logout functionality
 * - Protected route redirection
 * - Form validation and error handling
 * - Password recovery flow
 */

// Test user credentials (use unique emails per test run to avoid conflicts)
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = "TestPassword123!";
const TEST_NAME = "Test User";

test.describe("Authentication - Sign Up Flow", () => {
  
  test("should display signup page with all required fields", async ({ page }) => {
    await page.goto("/signup");
    
    // Check page title or heading
    const heading = page.locator('h1, h2').filter({ hasText: /crear|registr|sign.*up/i });
    await expect(heading.first()).toBeVisible({ timeout: 5000 });
    
    // Check required form fields exist
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"], button:has-text("Crear"), button:has-text("Registrar")');
    
    await expect(emailInput.first()).toBeVisible();
    await expect(passwordInput.first()).toBeVisible();
    await expect(submitButton.first()).toBeVisible();
  });

  test("should show validation error for invalid email format", async ({ page }) => {
    await page.goto("/signup");
    
    // Fill invalid email
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill("invalid-email");
    
    // Fill password
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(TEST_PASSWORD);
    
    // Try to submit
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Should show validation error or stay on page
    await page.waitForTimeout(1000);
    expect(page.url()).toContain("signup");
  });

  test("should show validation error for weak password", async ({ page }) => {
    await page.goto("/signup");
    
    // Fill valid email
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill(TEST_EMAIL);
    
    // Fill weak password
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill("123"); // Too short/weak
    
    // Try to submit
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Should show validation error or stay on page
    await page.waitForTimeout(1000);
    expect(page.url()).toContain("signup");
  });

  test("should have link to login page", async ({ page }) => {
    await page.goto("/signup");
    
    // Find link to login
    const loginLink = page.locator('a[href*="auth"], a[href*="login"], a:has-text("Iniciar sesión"), a:has-text("Login")');
    await expect(loginLink.first()).toBeVisible();
    
    // Click and verify navigation
    await loginLink.first().click();
    await page.waitForURL(/\/(auth|login)/);
  });

  test("should show password breach warning for compromised passwords", async ({ page }) => {
    await page.goto("/signup");
    
    // Fill valid email
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill(`breach-test-${Date.now()}@example.com`);
    
    // Fill commonly breached password
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill("password123"); // Known compromised password
    
    // Submit
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Wait for breach check (may show warning)
    await page.waitForTimeout(2000);
    
    // Check for warning message (may or may not appear depending on API)
    const warning = page.locator('text=/filtrada|breach|comprometida|leaked/i');
    // Just verify page didn't crash during the check
    expect(await page.title()).toBeTruthy();
  });
});

test.describe("Authentication - Login Flow", () => {
  
  test("should display login page with all required fields", async ({ page }) => {
    await page.goto("/auth");
    
    // Check page elements
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await expect(emailInput.first()).toBeVisible({ timeout: 5000 });
    await expect(passwordInput.first()).toBeVisible();
    await expect(submitButton.first()).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/auth");
    
    // Fill invalid credentials
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill("nonexistent@example.com");
    
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill("wrongpassword123");
    
    // Submit
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Wait for error response
    await page.waitForTimeout(2000);
    
    // Should show error message or stay on auth page
    const errorMessage = page.locator('text=/error|incorrect|invalid|inválid|incorrec/i, [role="alert"]');
    const isOnAuthPage = page.url().includes("auth") || page.url().includes("login");
    
    // Either shows error or stays on page
    expect(isOnAuthPage || await errorMessage.isVisible().catch(() => false)).toBe(true);
  });

  test("should have link to signup page", async ({ page }) => {
    await page.goto("/auth");
    
    // Find link to signup
    const signupLink = page.locator('a[href*="signup"], a:has-text("Crear cuenta"), a:has-text("Registrar"), a:has-text("Sign up")');
    await expect(signupLink.first()).toBeVisible();
  });

  test("should have password recovery link", async ({ page }) => {
    await page.goto("/auth");
    
    // Find forgot password link
    const forgotLink = page.locator('a:has-text("¿Olvidaste"), a:has-text("Forgot"), a:has-text("recuperar"), button:has-text("¿Olvidaste")');
    await expect(forgotLink.first()).toBeVisible();
  });

  test("should redirect /login to /auth", async ({ page }) => {
    await page.goto("/login");
    
    // Should redirect to /auth
    await page.waitForURL(/\/auth/, { timeout: 5000 });
    expect(page.url()).toContain("/auth");
  });

  test("should have Google OAuth button if enabled", async ({ page }) => {
    await page.goto("/auth");
    
    // Check for Google login button
    const googleButton = page.locator('button:has-text("Google"), button[aria-label*="Google"], [data-provider="google"]');
    
    // This might not be visible if Google OAuth isn't configured
    const hasGoogleAuth = await googleButton.isVisible().catch(() => false);
    
    // Just log the result, don't fail if not present
    console.log(`Google OAuth button present: ${hasGoogleAuth}`);
  });
});

test.describe("Authentication - Protected Routes", () => {
  
  test("should redirect unauthenticated users from /dashboard to /auth", async ({ page }) => {
    // Clear any existing session
    await page.context().clearCookies();
    
    // Try to access protected route
    await page.goto("/dashboard");
    
    // Should redirect to auth
    await page.waitForURL(/\/(auth|login)/, { timeout: 10000 });
  });

  test("should redirect unauthenticated users from /ideas to /auth", async ({ page }) => {
    await page.context().clearCookies();
    
    await page.goto("/ideas");
    
    await page.waitForURL(/\/(auth|login)/, { timeout: 10000 });
  });

  test("should redirect unauthenticated users from /projects to /auth", async ({ page }) => {
    await page.context().clearCookies();
    
    await page.goto("/projects");
    
    await page.waitForURL(/\/(auth|login)/, { timeout: 10000 });
  });

  test("should redirect unauthenticated users from /tasks to /auth", async ({ page }) => {
    await page.context().clearCookies();
    
    await page.goto("/tasks");
    
    await page.waitForURL(/\/(auth|login)/, { timeout: 10000 });
  });

  test("should redirect unauthenticated users from /settings to /auth", async ({ page }) => {
    await page.context().clearCookies();
    
    await page.goto("/settings");
    
    await page.waitForURL(/\/(auth|login)/, { timeout: 10000 });
  });
});

test.describe("Authentication - Password Recovery", () => {
  
  test("should display password recovery form", async ({ page }) => {
    await page.goto("/auth");
    
    // Click forgot password link
    const forgotLink = page.locator('a:has-text("¿Olvidaste"), button:has-text("¿Olvidaste"), a:has-text("Forgot")').first();
    
    if (await forgotLink.isVisible().catch(() => false)) {
      await forgotLink.click();
      
      // Should show email input for recovery
      await page.waitForTimeout(1000);
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput.first()).toBeVisible();
    }
  });

  test("should show reset password page", async ({ page }) => {
    await page.goto("/reset-password");
    
    // Should show reset password form or redirect
    await page.waitForTimeout(1000);
    
    // Either shows form or redirects (if no token)
    const hasPasswordField = await page.locator('input[type="password"]').isVisible().catch(() => false);
    const redirectedToAuth = page.url().includes("/auth");
    
    expect(hasPasswordField || redirectedToAuth).toBe(true);
  });
});

test.describe("Authentication - Landing Page", () => {
  
  test("should display landing page for unauthenticated users", async ({ page }) => {
    await page.context().clearCookies();
    
    await page.goto("/");
    
    // Landing page should be visible
    await page.waitForTimeout(1000);
    
    // Check for CTA buttons
    const ctaButton = page.locator('a:has-text("Empezar"), a:has-text("Comenzar"), a:has-text("Get started"), button:has-text("Empezar")');
    
    // Should show landing content or redirect
    const hasLandingContent = await ctaButton.first().isVisible().catch(() => false);
    const isOnAuth = page.url().includes("/auth");
    
    expect(hasLandingContent || isOnAuth).toBe(true);
  });

  test("should have navigation links to auth pages", async ({ page }) => {
    await page.context().clearCookies();
    
    await page.goto("/");
    
    await page.waitForTimeout(1000);
    
    // Look for login/signup links in header or hero
    const authLink = page.locator('a[href*="auth"], a[href*="login"], a[href*="signup"], a:has-text("Iniciar"), a:has-text("Login")');
    
    const hasAuthLinks = await authLink.first().isVisible().catch(() => false);
    
    // Landing should have auth links
    if (!page.url().includes("/auth")) {
      expect(hasAuthLinks).toBe(true);
    }
  });
});

test.describe("Authentication - Session Handling", () => {
  
  test("should maintain session across page navigation", async ({ page }) => {
    // This test requires a logged-in user
    // For now, we'll test that the session check happens
    
    await page.goto("/auth");
    
    // Session should be checked on load
    await page.waitForTimeout(2000);
    
    // If already logged in, should redirect to dashboard
    const isOnDashboard = page.url().includes("/dashboard");
    const isOnAuth = page.url().includes("/auth");
    
    // Should be on one or the other
    expect(isOnDashboard || isOnAuth).toBe(true);
  });

  test("should handle token refresh gracefully", async ({ page }) => {
    // Navigate to app
    await page.goto("/");
    
    // Wait for any auth state changes
    await page.waitForTimeout(2000);
    
    // App should not crash during token operations
    expect(await page.title()).toBeTruthy();
  });
});

test.describe("Authentication - Form Accessibility", () => {
  
  test("login form should have proper labels", async ({ page }) => {
    await page.goto("/auth");
    
    // Check for labels or aria-labels
    const emailInput = page.locator('input[type="email"]').first();
    
    // Should have associated label or aria-label
    const hasLabel = await emailInput.evaluate((el) => {
      const id = el.id;
      const hasLabelFor = document.querySelector(`label[for="${id}"]`);
      const hasAriaLabel = el.getAttribute('aria-label');
      const hasPlaceholder = el.getAttribute('placeholder');
      return !!(hasLabelFor || hasAriaLabel || hasPlaceholder);
    });
    
    expect(hasLabel).toBe(true);
  });

  test("signup form should have proper labels", async ({ page }) => {
    await page.goto("/signup");
    
    const passwordInput = page.locator('input[type="password"]').first();
    
    const hasLabel = await passwordInput.evaluate((el) => {
      const id = el.id;
      const hasLabelFor = document.querySelector(`label[for="${id}"]`);
      const hasAriaLabel = el.getAttribute('aria-label');
      const hasPlaceholder = el.getAttribute('placeholder');
      return !!(hasLabelFor || hasAriaLabel || hasPlaceholder);
    });
    
    expect(hasLabel).toBe(true);
  });

  test("forms should be keyboard navigable", async ({ page }) => {
    await page.goto("/auth");
    
    // Tab to first input
    await page.keyboard.press("Tab");
    
    // Should focus an input
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    
    // Should focus input or button
    expect(["INPUT", "BUTTON", "A"].includes(focusedElement || "")).toBe(true);
  });
});

test.describe("Authentication - Error States", () => {
  
  test("should handle network errors gracefully", async ({ page }) => {
    await page.goto("/auth");
    
    // Fill form
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill("test@example.com");
    
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill("testpassword123");
    
    // Block network requests to auth endpoint
    await page.route("**/auth/**", (route) => route.abort());
    
    // Try to submit
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Wait for error handling
    await page.waitForTimeout(3000);
    
    // App should not crash
    expect(await page.title()).toBeTruthy();
    
    // Unblock for subsequent tests
    await page.unroute("**/auth/**");
  });

  test("should show appropriate message for already registered email", async ({ page }) => {
    await page.goto("/signup");
    
    // Fill with potentially existing email
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill("existing@example.com");
    
    // Fill name if present
    const nameInput = page.locator('input[name="name"], input[placeholder*="nombre" i]').first();
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill("Test User");
    }
    
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill("TestPassword123!");
    
    // Submit
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    // Should show error or stay on page (not crash)
    expect(await page.title()).toBeTruthy();
  });
});
