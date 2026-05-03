import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { Confetti } from "./Confetti.js";

/**
 * W299 perf: confetti scales particle count to viewport so phones render
 * fewer DOM nodes than desktop. Phone (<480px) -> 60, tablet (<1024px) -> 70,
 * desktop (>=1024px) -> 80.
 */
function setViewportWidth(width: number): void {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
}

function countParticles(container: HTMLElement): number {
  const root = container.querySelector('[data-testid="confetti"]');
  if (!root) return 0;
  // Each particle is an absolutely-positioned div child of the root; the
  // first child is the <style> block holding the keyframes.
  return Array.from(root.children).filter((c) => c.tagName === "DIV").length;
}

describe("Confetti viewport-scaled particle count (W299)", () => {
  const originalWidth = window.innerWidth;

  afterEach(() => {
    cleanup();
    setViewportWidth(originalWidth);
  });

  it("renders 60 particles on phone-sized viewports (<480px)", () => {
    setViewportWidth(375);
    const { container } = render(<Confetti />);
    expect(countParticles(container)).toBe(60);
  });

  it("renders 70 particles on tablet-sized viewports (>=480px and <1024px)", () => {
    setViewportWidth(768);
    const { container } = render(<Confetti />);
    expect(countParticles(container)).toBe(70);
  });

  it("renders 80 particles on desktop-sized viewports (>=1024px)", () => {
    setViewportWidth(1440);
    const { container } = render(<Confetti />);
    expect(countParticles(container)).toBe(80);
  });
});

/**
 * W648 a11y: when the user has `prefers-reduced-motion: reduce` the component
 * must short-circuit — render nothing and call `onDone` immediately so the
 * caller's post-celebration flow proceeds without animation.
 */
describe("Confetti reduced-motion short-circuit (W648)", () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    cleanup();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: originalMatchMedia,
    });
  });

  it("returns null and calls onDone immediately when reduced motion is preferred", () => {
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

    const onDone = vi.fn();
    const { container } = render(<Confetti onDone={onDone} />);

    expect(container.querySelector('[data-testid="confetti"]')).toBeNull();
    expect(container.firstChild).toBeNull();
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
