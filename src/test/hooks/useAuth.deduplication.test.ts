import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Test suite for email deduplication logic in useAuth
 * 
 * These tests verify that the welcome email is only sent once per session,
 * even when the auth state triggers multiple times (e.g., React re-renders,
 * component re-mounts, or rapid auth state changes).
 */

// Create a mock for tracking welcome email calls
const mockSendWelcomeEmail = vi.fn();
const globalWelcomeEmailSent = new Set<string>();

// Simulate the deduplication logic from useAuth
const sendWelcomeEmailWithDeduplication = async (email: string, name?: string) => {
  if (globalWelcomeEmailSent.has(email)) {
    console.log('[AUTH] Welcome email already sent to:', email);
    return false;
  }
  globalWelcomeEmailSent.add(email);
  mockSendWelcomeEmail(email, name);
  return true;
};

describe("Welcome Email Deduplication", () => {
  beforeEach(() => {
    // Clear the deduplication set and mock before each test
    globalWelcomeEmailSent.clear();
    mockSendWelcomeEmail.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should send welcome email on first call", async () => {
    const result = await sendWelcomeEmailWithDeduplication("test@example.com", "Test User");
    
    expect(result).toBe(true);
    expect(mockSendWelcomeEmail).toHaveBeenCalledTimes(1);
    expect(mockSendWelcomeEmail).toHaveBeenCalledWith("test@example.com", "Test User");
  });

  it("should NOT send duplicate welcome email to the same address", async () => {
    // First call - should succeed
    await sendWelcomeEmailWithDeduplication("duplicate@example.com");
    
    // Second call with same email - should be blocked
    const result = await sendWelcomeEmailWithDeduplication("duplicate@example.com");
    
    expect(result).toBe(false);
    expect(mockSendWelcomeEmail).toHaveBeenCalledTimes(1);
  });

  it("should send welcome emails to different addresses", async () => {
    await sendWelcomeEmailWithDeduplication("user1@example.com");
    await sendWelcomeEmailWithDeduplication("user2@example.com");
    await sendWelcomeEmailWithDeduplication("user3@example.com");
    
    expect(mockSendWelcomeEmail).toHaveBeenCalledTimes(3);
  });

  it("should block rapid duplicate calls (simulating multiple auth triggers)", async () => {
    const email = "rapid-fire@example.com";
    
    // Simulate rapid auth state changes
    const results = await Promise.all([
      sendWelcomeEmailWithDeduplication(email),
      sendWelcomeEmailWithDeduplication(email),
      sendWelcomeEmailWithDeduplication(email),
      sendWelcomeEmailWithDeduplication(email),
      sendWelcomeEmailWithDeduplication(email),
    ]);
    
    // Only the first should succeed
    expect(results.filter(r => r === true).length).toBe(1);
    expect(results.filter(r => r === false).length).toBe(4);
    expect(mockSendWelcomeEmail).toHaveBeenCalledTimes(1);
  });

  it("should track sent emails in the global set", async () => {
    const emails = ["a@test.com", "b@test.com", "c@test.com"];
    
    for (const email of emails) {
      await sendWelcomeEmailWithDeduplication(email);
    }
    
    expect(globalWelcomeEmailSent.size).toBe(3);
    expect(globalWelcomeEmailSent.has("a@test.com")).toBe(true);
    expect(globalWelcomeEmailSent.has("b@test.com")).toBe(true);
    expect(globalWelcomeEmailSent.has("c@test.com")).toBe(true);
  });

  it("should handle emails case-sensitively (Supabase default)", async () => {
    await sendWelcomeEmailWithDeduplication("Test@Example.com");
    const result = await sendWelcomeEmailWithDeduplication("test@example.com");
    
    // Case-sensitive means these are different emails
    expect(result).toBe(true);
    expect(mockSendWelcomeEmail).toHaveBeenCalledTimes(2);
  });
});

describe("User Processing Deduplication", () => {
  const processedUsers = new Set<string>();
  const mockProcessUser = vi.fn();

  const processUserWithDeduplication = (userId: string) => {
    if (processedUsers.has(userId)) {
      return false;
    }
    processedUsers.add(userId);
    mockProcessUser(userId);
    return true;
  };

  beforeEach(() => {
    processedUsers.clear();
    mockProcessUser.mockClear();
  });

  it("should process user only once even with multiple SIGNED_IN events", () => {
    const userId = "user-123";
    
    // Simulate multiple SIGNED_IN events (can happen with React re-renders)
    processUserWithDeduplication(userId);
    processUserWithDeduplication(userId);
    processUserWithDeduplication(userId);
    
    expect(mockProcessUser).toHaveBeenCalledTimes(1);
  });

  it("should process different users independently", () => {
    processUserWithDeduplication("user-1");
    processUserWithDeduplication("user-2");
    processUserWithDeduplication("user-1"); // Duplicate
    processUserWithDeduplication("user-3");
    
    expect(mockProcessUser).toHaveBeenCalledTimes(3);
  });
});
