import { describe, it, expect, afterEach } from "vitest";
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
