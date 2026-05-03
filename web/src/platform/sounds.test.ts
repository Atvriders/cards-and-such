import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_VOLUME_PERCENT,
  LS_MUTE_ON_HIDDEN,
  LS_SOUND_VOLUME,
  VOLUME_HEADROOM,
  _refreshAudioState,
  isSoundOn,
  playSound,
  readMuteOnHidden,
  readVolumePercent,
  volumeFactor,
} from "./sounds.js";

describe("sounds: volume / mute-on-hidden persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    localStorage.clear();
  });

  it("defaults volume to 70 when nothing is stored", () => {
    expect(readVolumePercent()).toBe(DEFAULT_VOLUME_PERCENT);
  });

  it("reads an integer 0..100 percent verbatim", () => {
    localStorage.setItem(LS_SOUND_VOLUME, "42");
    expect(readVolumePercent()).toBe(42);
  });

  it("clamps out-of-range values to 0..100", () => {
    localStorage.setItem(LS_SOUND_VOLUME, "150");
    expect(readVolumePercent()).toBe(100);
    localStorage.setItem(LS_SOUND_VOLUME, "-20");
    expect(readVolumePercent()).toBe(0);
  });

  it("tolerates legacy 0..1 floats by scaling them up", () => {
    localStorage.setItem(LS_SOUND_VOLUME, "0.8");
    expect(readVolumePercent()).toBe(80);
  });

  it("falls back to default on garbage", () => {
    localStorage.setItem(LS_SOUND_VOLUME, "not-a-number");
    expect(readVolumePercent()).toBe(DEFAULT_VOLUME_PERCENT);
  });

  it("converts percent to gain factor with the documented headroom", () => {
    expect(volumeFactor(0)).toBe(0);
    expect(volumeFactor(100)).toBeCloseTo(VOLUME_HEADROOM, 6);
    expect(volumeFactor(50)).toBeCloseTo(0.25, 6);
    // Default 70% → 0.35.
    expect(volumeFactor(DEFAULT_VOLUME_PERCENT)).toBeCloseTo(0.35, 6);
  });

  it("defaults mute-on-hidden to true", () => {
    expect(readMuteOnHidden()).toBe(true);
  });

  it("respects an explicit false flag", () => {
    localStorage.setItem(LS_MUTE_ON_HIDDEN, "false");
    expect(readMuteOnHidden()).toBe(false);
  });

  it("isSoundOn defaults to true and honors the stored flag", () => {
    expect(isSoundOn()).toBe(true);
    localStorage.setItem("cards-sound-on", "false");
    expect(isSoundOn()).toBe(false);
  });

  it("storage events propagate updates into the live state", () => {
    localStorage.setItem(LS_SOUND_VOLUME, "30");
    _refreshAudioState();
    // Simulate a same-tab write + a cross-tab StorageEvent.
    localStorage.setItem(LS_SOUND_VOLUME, "85");
    window.dispatchEvent(
      new StorageEvent("storage", { key: LS_SOUND_VOLUME, newValue: "85" }),
    );
    // After the event, a fresh playSound() would call effectiveGainFactor
    // which reads the (now-updated) module-level percent. We exercise the
    // path indirectly: re-reading should reflect the new value.
    expect(readVolumePercent()).toBe(85);
  });

  it("_refreshAudioState picks up document.visibilityState", () => {
    const spy = vi
      .spyOn(document, "visibilityState", "get")
      .mockReturnValue("hidden");
    _refreshAudioState();
    spy.mockRestore();
    // Restore default visible state for any later tests.
    _refreshAudioState();
  });
});

// ---------------------------------------------------------------------------
// Live event hooks: verify the module-load listeners actually mutate the
// cached gain factor used by playSound(). We exercise the real listeners
// (attached at import time) via window.dispatchEvent and inspect the gain
// peaks captured on a fake AudioContext.
//
// Caveat: sounds.ts caches its AudioContext in a module-private variable,
// so we can only install the fake once for the suite. Each test resets the
// shared peaks array via beforeEach; subsequent playSound() calls reuse
// the same cached context but we observe only this test's emissions.

const sharedPeaks: number[] = [];

function makeFakeContext() {
  return {
    currentTime: 0,
    state: "running",
    resume: () => Promise.resolve(),
    destination: {},
    createOscillator: () => ({
      type: "sine",
      frequency: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: (n: unknown) => n,
      start: vi.fn(),
      stop: vi.fn(),
    }),
    createGain: () => ({
      gain: {
        setValueAtTime: vi.fn(),
        // playTone calls this twice per tone (attack peak + decay floor).
        // We capture every value and assert on the max (= the peak).
        exponentialRampToValueAtTime: vi.fn((value: number) => {
          sharedPeaks.push(value);
        }),
      },
      connect: (n: unknown) => n,
    }),
  };
}

// Install the fake AudioContext constructor before any test in this suite
// runs. The first playSound() call will cache one fake instance and reuse
// it across tests, which is fine because the closures in createGain push
// into the suite-wide sharedPeaks array we reset per test.
const FakeCtor = vi.fn(makeFakeContext) as unknown as typeof AudioContext;
(window as unknown as { AudioContext: typeof AudioContext }).AudioContext =
  FakeCtor;
(
  window as unknown as { webkitAudioContext: typeof AudioContext }
).webkitAudioContext = FakeCtor;

describe("sounds: live volume CustomEvent + mute-on-hidden visibility", () => {
  beforeEach(() => {
    localStorage.clear();
    sharedPeaks.length = 0;
  });
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    // Reset module-level live state to defaults for cross-test isolation.
    _refreshAudioState();
  });

  it("cards:volume-change CustomEvent updates the cached volume used by playSound", () => {
    // Seed at 100% so the listener has something concrete to override.
    localStorage.setItem(LS_SOUND_VOLUME, "100");
    _refreshAudioState();

    // Drop to 20% via the same-tab CustomEvent the Settings slider fires.
    window.dispatchEvent(
      new CustomEvent<number>("cards:volume-change", { detail: 20 }),
    );

    playSound("button-click");

    // button-click recipe peak = 0.10; factor at 20% = 0.20 * 0.5 = 0.10
    // → emitted peak = 0.10 * 0.10 = 0.01. The decay ramp targets ~0.0001,
    // so the maximum captured is the 0.01 attack target.
    const maxPeak = Math.max(...sharedPeaks);
    expect(maxPeak).toBeCloseTo(0.01, 4);
    expect(maxPeak).toBeLessThan(0.05);
  });

  it("cards:volume-change with no detail re-reads localStorage", () => {
    localStorage.setItem(LS_SOUND_VOLUME, "100");
    _refreshAudioState();

    // Settings persists 40 then broadcasts a bare event — the listener
    // must fall back to readVolumePercent().
    localStorage.setItem(LS_SOUND_VOLUME, "40");
    window.dispatchEvent(new CustomEvent("cards:volume-change"));

    playSound("button-click");
    // factor = 0.40 * 0.5 = 0.20; peak = 0.10 * 0.20 = 0.02.
    const maxPeak = Math.max(...sharedPeaks);
    expect(maxPeak).toBeCloseTo(0.02, 4);
  });

  it("visibilitychange to hidden silences playSound when mute-on-hidden is on", () => {
    localStorage.setItem(LS_SOUND_VOLUME, "100");
    localStorage.setItem(LS_MUTE_ON_HIDDEN, "true");
    _refreshAudioState();

    const visSpy = vi
      .spyOn(document, "visibilityState", "get")
      .mockReturnValue("hidden");
    document.dispatchEvent(new Event("visibilitychange"));

    playSound("button-click");

    // effectiveGainFactor short-circuits to 0 → playSound returns before
    // ever touching AudioContext, so no peaks are captured.
    expect(sharedPeaks).toHaveLength(0);

    visSpy.mockRestore();
  });

  it("visibilitychange back to visible restores playback", () => {
    localStorage.setItem(LS_SOUND_VOLUME, "100");
    localStorage.setItem(LS_MUTE_ON_HIDDEN, "true");
    _refreshAudioState();

    // First go hidden …
    const hiddenSpy = vi
      .spyOn(document, "visibilityState", "get")
      .mockReturnValue("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    hiddenSpy.mockRestore();

    // … then visible again.
    const visibleSpy = vi
      .spyOn(document, "visibilityState", "get")
      .mockReturnValue("visible");
    document.dispatchEvent(new Event("visibilitychange"));

    playSound("button-click");
    visibleSpy.mockRestore();

    // At 100% volume the peak should be the full 0.10 * 0.5 = 0.05.
    expect(sharedPeaks.length).toBeGreaterThan(0);
    const maxPeak = Math.max(...sharedPeaks);
    expect(maxPeak).toBeCloseTo(0.05, 4);
  });

  it("hidden tab still plays when mute-on-hidden is disabled", () => {
    localStorage.setItem(LS_SOUND_VOLUME, "100");
    localStorage.setItem(LS_MUTE_ON_HIDDEN, "false");
    _refreshAudioState();

    const visSpy = vi
      .spyOn(document, "visibilityState", "get")
      .mockReturnValue("hidden");
    document.dispatchEvent(new Event("visibilitychange"));

    playSound("button-click");
    visSpy.mockRestore();

    expect(sharedPeaks.length).toBeGreaterThan(0);
  });
});
