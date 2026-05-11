import { describe, it, expect, afterEach, vi } from "vitest";
import { act, render, cleanup } from "@testing-library/react";
import { SparkleHost, emitSparkles, emitSparklesFromEvent } from "./Sparkles.js";

/**
 * SparkleHost renders nothing until a burst is emitted. After emitSparkles()
 * is called, the overlay container and a batch of star particles appear in
 * the DOM and are cleaned up after the animation duration elapses.
 */
describe("SparkleHost", () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: originalMatchMedia,
    });
  });

  it("renders nothing initially (no burst emitted yet)", () => {
    const { container } = render(<SparkleHost />);
    expect(container.firstChild).toBeNull();
    expect(container.querySelector('[data-testid="sparkle-host"]')).toBeNull();
  });

  it("renders the overlay and 6-12 particles after emitSparkles() fires", () => {
    // Force reduced-motion to false so emit isn't suppressed.
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });

    const { container } = render(<SparkleHost />);

    act(() => {
      emitSparkles(120, 240);
    });

    const host = container.querySelector('[data-testid="sparkle-host"]');
    expect(host).not.toBeNull();
    expect(host?.getAttribute("aria-hidden")).toBe("true");

    const particles = container.querySelectorAll(".sparkle-particle");
    expect(particles.length).toBeGreaterThanOrEqual(6);
    expect(particles.length).toBeLessThanOrEqual(12);

    // Each particle should be positioned at the emit coordinates and contain
    // the inline 4-point star SVG.
    const first = particles[0] as HTMLElement;
    expect(first.style.left).toBe("120px");
    expect(first.style.top).toBe("240px");
    expect(first.querySelector("svg")).not.toBeNull();
  });

  it("is a no-op when prefers-reduced-motion is set", () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: (query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });

    const { container } = render(<SparkleHost />);

    act(() => {
      emitSparklesFromEvent({ clientX: 50, clientY: 50 });
    });

    expect(container.querySelector('[data-testid="sparkle-host"]')).toBeNull();
    expect(container.querySelector(".sparkle-particle")).toBeNull();
  });
});
