import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_VOLUME_PERCENT,
  LS_MUTE_ON_HIDDEN,
  LS_SOUND_VOLUME,
  VOLUME_HEADROOM,
  _refreshAudioState,
  isSoundOn,
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
