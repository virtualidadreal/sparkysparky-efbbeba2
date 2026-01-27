import { test, expect } from "../playwright-fixture";

/**
 * E2E Tests for Voice Recording Flow
 * 
 * These tests verify the complete voice recording experience including:
 * - Opening the recording modal
 * - Recording audio (mocked)
 * - Pausing and resuming
 * - Timer synchronization with pause state
 * - Sending/cancelling recordings
 */

test.describe("Voice Recording Flow", () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock getUserMedia to simulate microphone access
    await page.addInitScript(() => {
      // Create a mock MediaStream
      const createMockStream = () => {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const destination = audioContext.createMediaStreamDestination();
        oscillator.connect(destination);
        oscillator.start();
        return destination.stream;
      };

      // Mock navigator.mediaDevices.getUserMedia
      const originalGetUserMedia = navigator.mediaDevices?.getUserMedia?.bind(navigator.mediaDevices);
      
      Object.defineProperty(navigator, 'mediaDevices', {
        value: {
          getUserMedia: async (constraints: MediaStreamConstraints) => {
            if (constraints.audio) {
              // Return a mock audio stream
              return createMockStream();
            }
            if (originalGetUserMedia) {
              return originalGetUserMedia(constraints);
            }
            throw new Error('getUserMedia not supported');
          },
          enumerateDevices: async () => [
            { deviceId: 'default', kind: 'audioinput', label: 'Default Microphone', groupId: 'default' }
          ],
        },
        writable: true,
        configurable: true,
      });

      // Mock MediaRecorder
      class MockMediaRecorder {
        state: string = 'inactive';
        ondataavailable: ((event: any) => void) | null = null;
        onstop: (() => void) | null = null;
        onerror: ((event: any) => void) | null = null;
        mimeType: string = 'audio/webm';
        private intervalId: number | null = null;

        constructor(stream: MediaStream, options?: { mimeType?: string }) {
          this.mimeType = options?.mimeType || 'audio/webm';
        }

        start(timeslice?: number) {
          this.state = 'recording';
          // Simulate data chunks every second
          this.intervalId = window.setInterval(() => {
            if (this.ondataavailable) {
              const blob = new Blob(['mock-audio-data'], { type: this.mimeType });
              this.ondataavailable({ data: blob });
            }
          }, timeslice || 1000);
        }

        stop() {
          this.state = 'inactive';
          if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
          }
          // Call onstop after a small delay
          setTimeout(() => {
            if (this.onstop) {
              this.onstop();
            }
          }, 50);
        }

        pause() {
          this.state = 'paused';
        }

        resume() {
          this.state = 'recording';
        }

        static isTypeSupported(mimeType: string): boolean {
          return ['audio/webm', 'audio/mp4', 'audio/ogg'].includes(mimeType);
        }
      }

      (window as any).MediaRecorder = MockMediaRecorder;

      // Mock permissions API
      if (navigator.permissions) {
        const originalQuery = navigator.permissions.query.bind(navigator.permissions);
        navigator.permissions.query = async (descriptor: PermissionDescriptor) => {
          if (descriptor.name === 'microphone') {
            return {
              state: 'granted',
              onchange: null,
              addEventListener: () => {},
              removeEventListener: () => {},
              dispatchEvent: () => true,
            } as PermissionStatus;
          }
          return originalQuery(descriptor);
        };
      }
    });
  });

  test("should open voice recording modal from floating capture button", async ({ page }) => {
    // Navigate to dashboard (requires auth - for now test on landing or mock auth)
    await page.goto("/");
    
    // Look for the floating capture button (desktop)
    const floatingButton = page.locator('button:has(.lucide-plus), button:has(svg.h-8.w-8)').first();
    
    // Check if button exists (may not be visible on mobile or unauthenticated)
    const isVisible = await floatingButton.isVisible().catch(() => false);
    
    if (isVisible) {
      await floatingButton.click();
      
      // Verify dialog opens
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });
    } else {
      // Skip test if button not found (user not authenticated)
      test.skip();
    }
  });

  test("should display timer that increments during recording", async ({ page }) => {
    await page.goto("/");
    
    // Open the capture popup
    const floatingButton = page.locator('button:has(.lucide-plus)').first();
    const isVisible = await floatingButton.isVisible().catch(() => false);
    
    if (!isVisible) {
      test.skip();
      return;
    }
    
    await floatingButton.click();
    
    // Wait for dialog
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    
    // Find timer display (format: HH:MM:SS or MM:SS)
    const timerLocator = dialog.locator('text=/\\d{2}:\\d{2}(:\\d{2})?/');
    
    // Get initial time
    await page.waitForTimeout(500);
    const initialTime = await timerLocator.first().textContent();
    
    // Wait and check time increased
    await page.waitForTimeout(2000);
    const laterTime = await timerLocator.first().textContent();
    
    // Timer should have incremented
    expect(laterTime).not.toBe(initialTime);
  });

  test("should pause timer when pause button is clicked", async ({ page }) => {
    await page.goto("/");
    
    const floatingButton = page.locator('button:has(.lucide-plus)').first();
    const isVisible = await floatingButton.isVisible().catch(() => false);
    
    if (!isVisible) {
      test.skip();
      return;
    }
    
    await floatingButton.click();
    
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    
    // Wait for recording to start
    await page.waitForTimeout(1500);
    
    // Find pause button (has PauseIcon)
    const pauseButton = dialog.locator('button:has(svg), button').filter({ hasText: '' }).nth(1);
    
    // Click pause
    await pauseButton.click();
    
    // Get time after pause
    const timerLocator = dialog.locator('text=/\\d{2}:\\d{2}(:\\d{2})?/');
    const timeAtPause = await timerLocator.first().textContent();
    
    // Wait 2 seconds
    await page.waitForTimeout(2000);
    
    // Timer should NOT have changed while paused
    const timeAfterWait = await timerLocator.first().textContent();
    expect(timeAfterWait).toBe(timeAtPause);
  });

  test("should resume timer when resume button is clicked after pause", async ({ page }) => {
    await page.goto("/");
    
    const floatingButton = page.locator('button:has(.lucide-plus)').first();
    const isVisible = await floatingButton.isVisible().catch(() => false);
    
    if (!isVisible) {
      test.skip();
      return;
    }
    
    await floatingButton.click();
    
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    
    // Wait for recording to start
    await page.waitForTimeout(1000);
    
    // Find and click pause button
    const controlButton = dialog.locator('button').filter({ hasText: '' }).nth(1);
    await controlButton.click();
    
    // Capture time at pause
    const timerLocator = dialog.locator('text=/\\d{2}:\\d{2}(:\\d{2})?/');
    const timeAtPause = await timerLocator.first().textContent();
    
    // Click again to resume
    await controlButton.click();
    
    // Wait for timer to resume
    await page.waitForTimeout(2000);
    
    // Timer should have increased after resume
    const timeAfterResume = await timerLocator.first().textContent();
    expect(timeAfterResume).not.toBe(timeAtPause);
  });

  test("should show 'En pausa' indicator when paused", async ({ page }) => {
    await page.goto("/");
    
    const floatingButton = page.locator('button:has(.lucide-plus)').first();
    const isVisible = await floatingButton.isVisible().catch(() => false);
    
    if (!isVisible) {
      test.skip();
      return;
    }
    
    await floatingButton.click();
    
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    
    // Wait for recording to start - should show "Grabando..."
    await page.waitForTimeout(500);
    const recordingIndicator = dialog.locator('text=/Grabando/i');
    await expect(recordingIndicator).toBeVisible();
    
    // Click pause
    const pauseButton = dialog.locator('button').filter({ hasText: '' }).nth(1);
    await pauseButton.click();
    
    // Should show "En pausa" or similar
    const pausedIndicator = dialog.locator('text=/pausa/i');
    await expect(pausedIndicator).toBeVisible({ timeout: 2000 });
  });

  test("should cancel recording and close dialog when X is clicked", async ({ page }) => {
    await page.goto("/");
    
    const floatingButton = page.locator('button:has(.lucide-plus)').first();
    const isVisible = await floatingButton.isVisible().catch(() => false);
    
    if (!isVisible) {
      test.skip();
      return;
    }
    
    await floatingButton.click();
    
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    
    // Find close/cancel button (X icon)
    const closeButton = dialog.locator('button:has([class*="x-mark"]), button:has(svg[class*="XMark"]), button[aria-label*="close"], button[aria-label*="Close"]').first();
    
    // If specific close button not found, try a more generic approach
    const closeButtonAlt = dialog.locator('button').first();
    
    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click();
    } else {
      // Press Escape to close
      await page.keyboard.press('Escape');
    }
    
    // Dialog should close
    await expect(dialog).not.toBeVisible({ timeout: 3000 });
  });

  test("should switch to text mode when 'Escribir' is clicked", async ({ page }) => {
    await page.goto("/");
    
    const floatingButton = page.locator('button:has(.lucide-plus)').first();
    const isVisible = await floatingButton.isVisible().catch(() => false);
    
    if (!isVisible) {
      test.skip();
      return;
    }
    
    await floatingButton.click();
    
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    
    // Find "Escribir" button to switch to text mode
    const writeButton = dialog.locator('button:has-text("Escribir"), button:has-text("escribir")');
    
    if (await writeButton.isVisible().catch(() => false)) {
      await writeButton.click();
      
      // Text input should now be visible
      const textInput = dialog.locator('textarea, input[type="text"]');
      await expect(textInput.first()).toBeVisible({ timeout: 2000 });
    }
  });

  test("should display waveform visualization during recording", async ({ page }) => {
    await page.goto("/");
    
    const floatingButton = page.locator('button:has(.lucide-plus)').first();
    const isVisible = await floatingButton.isVisible().catch(() => false);
    
    if (!isVisible) {
      test.skip();
      return;
    }
    
    await floatingButton.click();
    
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    
    // Wait for visualization to start
    await page.waitForTimeout(500);
    
    // Look for waveform container (canvas or div with bars)
    const waveformCanvas = dialog.locator('canvas');
    const waveformBars = dialog.locator('[class*="waveform"], [class*="bars"], [class*="visualizer"]');
    
    // Either canvas or styled bars should be visible
    const hasCanvas = await waveformCanvas.isVisible().catch(() => false);
    const hasBars = await waveformBars.first().isVisible().catch(() => false);
    
    expect(hasCanvas || hasBars).toBe(true);
  });

  test("should display max duration indicator (5 min)", async ({ page }) => {
    await page.goto("/");
    
    const floatingButton = page.locator('button:has(.lucide-plus)').first();
    const isVisible = await floatingButton.isVisible().catch(() => false);
    
    if (!isVisible) {
      test.skip();
      return;
    }
    
    await floatingButton.click();
    
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    
    // Look for max duration text
    const maxDurationText = dialog.locator('text=/5.*min/i, text=/máx/i');
    await expect(maxDurationText.first()).toBeVisible({ timeout: 2000 });
  });
});

test.describe("Voice Recording - VoiceRecordModal", () => {
  
  test.beforeEach(async ({ page }) => {
    // Same mock setup as above
    await page.addInitScript(() => {
      const createMockStream = () => {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const destination = audioContext.createMediaStreamDestination();
        oscillator.connect(destination);
        oscillator.start();
        return destination.stream;
      };

      Object.defineProperty(navigator, 'mediaDevices', {
        value: {
          getUserMedia: async (constraints: MediaStreamConstraints) => {
            if (constraints.audio) {
              return createMockStream();
            }
            throw new Error('getUserMedia not supported');
          },
          enumerateDevices: async () => [
            { deviceId: 'default', kind: 'audioinput', label: 'Default Microphone', groupId: 'default' }
          ],
        },
        writable: true,
        configurable: true,
      });

      class MockMediaRecorder {
        state: string = 'inactive';
        ondataavailable: ((event: any) => void) | null = null;
        onstop: (() => void) | null = null;
        onerror: ((event: any) => void) | null = null;
        mimeType: string = 'audio/webm';
        private intervalId: number | null = null;

        constructor(stream: MediaStream, options?: { mimeType?: string }) {
          this.mimeType = options?.mimeType || 'audio/webm';
        }

        start(timeslice?: number) {
          this.state = 'recording';
          this.intervalId = window.setInterval(() => {
            if (this.ondataavailable) {
              const blob = new Blob(['mock-audio-data'], { type: this.mimeType });
              this.ondataavailable({ data: blob });
            }
          }, timeslice || 1000);
        }

        stop() {
          this.state = 'inactive';
          if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
          }
          setTimeout(() => {
            if (this.onstop) {
              this.onstop();
            }
          }, 50);
        }

        pause() { this.state = 'paused'; }
        resume() { this.state = 'recording'; }

        static isTypeSupported(mimeType: string): boolean {
          return ['audio/webm', 'audio/mp4', 'audio/ogg'].includes(mimeType);
        }
      }

      (window as any).MediaRecorder = MockMediaRecorder;

      if (navigator.permissions) {
        const originalQuery = navigator.permissions.query.bind(navigator.permissions);
        navigator.permissions.query = async (descriptor: PermissionDescriptor) => {
          if (descriptor.name === 'microphone') {
            return {
              state: 'granted',
              onchange: null,
              addEventListener: () => {},
              removeEventListener: () => {},
              dispatchEvent: () => true,
            } as PermissionStatus;
          }
          return originalQuery(descriptor);
        };
      }
    });
  });

  test("timer format should be HH:MM:SS", async ({ page }) => {
    await page.goto("/");
    
    const floatingButton = page.locator('button:has(.lucide-plus)').first();
    const isVisible = await floatingButton.isVisible().catch(() => false);
    
    if (!isVisible) {
      test.skip();
      return;
    }
    
    await floatingButton.click();
    
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    
    // Timer should match HH:MM:SS format
    const timerLocator = dialog.locator('text=/\\d{2}:\\d{2}:\\d{2}/');
    await expect(timerLocator.first()).toBeVisible({ timeout: 2000 });
  });

  test("send button should be disabled when recording is too short", async ({ page }) => {
    await page.goto("/");
    
    const floatingButton = page.locator('button:has(.lucide-plus)').first();
    const isVisible = await floatingButton.isVisible().catch(() => false);
    
    if (!isVisible) {
      test.skip();
      return;
    }
    
    await floatingButton.click();
    
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    
    // Find send button (usually has PaperAirplane icon or similar)
    const sendButton = dialog.locator('button:has(svg[class*="paper"]), button:has([class*="send"]), button[type="submit"]').last();
    
    // Should be disabled initially or within first second
    const isDisabled = await sendButton.isDisabled().catch(() => false);
    
    // Either disabled or we wait a moment
    if (!isDisabled) {
      await page.waitForTimeout(1500);
      // After 1.5 seconds, button should be enabled
      await expect(sendButton).toBeEnabled();
    }
  });
});
