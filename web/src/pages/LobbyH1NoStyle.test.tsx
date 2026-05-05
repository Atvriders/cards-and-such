import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2110 — pin that the LobbyPage hero <h1> element carries NO inline
 * `style` attribute. The hero heading is styled exclusively via parent
 * CSS (.lobby-hero) and the inner <span class="lobby-hero-title">; no
 * inline styles should leak onto the heading itself.
 *
 * Using `hasAttribute("style") === false` is strictly tighter than
 * checking that style.cssText is empty — React only emits a `style`
 * attribute on the DOM when at least one inline style is provided, so
 * the absence of the attribute pins that no inline styling has been
 * introduced (regression-catching for accidental `style={{...}}` props).
 */
describe("LobbyPage — hero h1 has no style attribute (W2110)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the hero <h1> without a style attribute", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const h1 = container.querySelector<HTMLHeadingElement>("h1");
    expect(h1).not.toBeNull();
    expect(h1!.tagName).toBe("H1");

    // The h1 must not have a `style` attribute of any value.
    expect(h1!.hasAttribute("style")).toBe(false);
  });
});
