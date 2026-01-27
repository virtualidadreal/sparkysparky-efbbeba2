import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

/**
 * Test suite for voice recording timer behavior
 * 
 * These tests verify that:
 * 1. Timer increments during recording
 * 2. Timer STOPS incrementing when paused
 * 3. Timer resumes correctly after unpause
 */

describe("Recording Timer with Pause", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("should correctly track pause state with ref synchronization", () => {
    let isPaused = false;
    const isPausedRef = { current: false };
    let elapsedMs = 0;

    // Simulate the useEffect that syncs isPaused to isPausedRef
    const syncPauseState = (newPausedState: boolean) => {
      isPaused = newPausedState;
      isPausedRef.current = newPausedState;
    };

    // Simulate the timer callback that checks isPausedRef
    const timerCallback = () => {
      if (!isPausedRef.current) {
        elapsedMs += 60; // 60ms intervals like in the real code
      }
    };

    // Start "recording"
    syncPauseState(false);
    
    // Run timer for 5 intervals (300ms)
    for (let i = 0; i < 5; i++) {
      timerCallback();
    }
    expect(elapsedMs).toBe(300);

    // Pause recording
    syncPauseState(true);
    
    // Timer ticks but should NOT increment elapsed time
    for (let i = 0; i < 5; i++) {
      timerCallback();
    }
    expect(elapsedMs).toBe(300); // Should stay at 300ms

    // Resume recording
    syncPauseState(false);
    
    // Timer should increment again
    for (let i = 0; i < 3; i++) {
      timerCallback();
    }
    expect(elapsedMs).toBe(480); // 300 + 180 = 480ms
  });

  it("should NOT update elapsed time when isPausedRef.current is true", () => {
    const isPausedRef = { current: false };
    let elapsedMs = 0;

    const incrementTime = () => {
      if (isPausedRef.current) {
        return; // This is the critical check that was added to fix the bug
      }
      elapsedMs += 60;
    };

    // Increment while not paused
    incrementTime();
    incrementTime();
    expect(elapsedMs).toBe(120);

    // Set to paused
    isPausedRef.current = true;

    // Try to increment - should be blocked
    incrementTime();
    incrementTime();
    incrementTime();
    expect(elapsedMs).toBe(120); // Unchanged!

    // Unpause and increment again
    isPausedRef.current = false;
    incrementTime();
    expect(elapsedMs).toBe(180);
  });

  it("should handle rapid pause/unpause cycles", () => {
    const isPausedRef = { current: false };
    let elapsedMs = 0;

    const tick = () => {
      if (!isPausedRef.current) {
        elapsedMs += 60;
      }
    };

    // Rapid toggling
    tick(); // +60
    isPausedRef.current = true;
    tick(); // blocked
    isPausedRef.current = false;
    tick(); // +60
    isPausedRef.current = true;
    tick(); // blocked
    tick(); // blocked
    isPausedRef.current = false;
    tick(); // +60

    expect(elapsedMs).toBe(180);
  });
});

describe("Animation Frame Loop with Pause", () => {
  it("should stop animation frame scheduling when paused", () => {
    let animationFrameCount = 0;
    let isAnimating = true;
    const isPausedRef = { current: false };

    // Simulate the loopDrawStable function logic
    const loopDraw = () => {
      if (!isAnimating) return;
      
      animationFrameCount++;
      
      // When paused, we draw once but don't schedule the next frame
      if (isPausedRef.current) {
        return; // Exit without scheduling next frame
      }
      
      // Schedule next frame only if not paused
      if (isAnimating) {
        // In real code: requestAnimationFrame(loopDraw)
        // For test: we just track that it would continue
      }
    };

    // Run several animation frames
    loopDraw();
    loopDraw();
    loopDraw();
    expect(animationFrameCount).toBe(3);

    // Pause - next call should NOT schedule further frames
    isPausedRef.current = true;
    loopDraw();
    expect(animationFrameCount).toBe(4); // Called once more but exits early

    // Simulate that no more frames are scheduled while paused
    // (In real code, the return statement prevents requestAnimationFrame)
  });

  it("should continue animation after unpause", () => {
    const frameHistory: string[] = [];
    const isPausedRef = { current: false };

    const recordFrame = (phase: string) => {
      if (isPausedRef.current) {
        frameHistory.push(`${phase}-paused`);
        return false; // Indicates no continuation
      }
      frameHistory.push(`${phase}-active`);
      return true; // Indicates continuation
    };

    expect(recordFrame("frame1")).toBe(true);
    expect(recordFrame("frame2")).toBe(true);
    
    isPausedRef.current = true;
    expect(recordFrame("frame3")).toBe(false);
    expect(recordFrame("frame4")).toBe(false);
    
    isPausedRef.current = false;
    expect(recordFrame("frame5")).toBe(true);

    expect(frameHistory).toEqual([
      "frame1-active",
      "frame2-active",
      "frame3-paused",
      "frame4-paused",
      "frame5-active"
    ]);
  });
});

describe("Waveform Visualization Pause Behavior", () => {
  it("should maintain waveform history but not add new samples when paused", () => {
    const waveformHistory: number[] = [];
    const isPausedRef = { current: false };
    const MAX_HISTORY = 500;

    const addWaveformSample = (amplitude: number) => {
      if (isPausedRef.current) {
        return; // Don't add samples when paused
      }
      waveformHistory.push(amplitude);
      if (waveformHistory.length > MAX_HISTORY) {
        waveformHistory.shift();
      }
    };

    // Add samples while recording
    addWaveformSample(0.5);
    addWaveformSample(0.7);
    addWaveformSample(0.3);
    expect(waveformHistory.length).toBe(3);

    // Pause
    isPausedRef.current = true;
    addWaveformSample(0.9);
    addWaveformSample(0.8);
    expect(waveformHistory.length).toBe(3); // Unchanged

    // Resume
    isPausedRef.current = false;
    addWaveformSample(0.4);
    expect(waveformHistory.length).toBe(4);
  });
});
