import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2299 — the decorative magnifier glyph in the lobby search wrapper
 * (`<span class="lobby-search-icon" aria-hidden="true">`) contains an
 * inline `<svg>` whose literal `viewBox` attribute is `"0 0 24 24"`.
 *
 * Why this needs its own pin:
 *  - The path coordinates inside the magnifier glyph (`<circle cx="11"
 *    cy="11" r="7" />` and `<path d="m20 20-3.5-3.5" />`) are authored
 *    against a 24×24 SVG canvas. If the viewBox is changed (e.g. to
 *    "0 0 16 16" to match the rendered width/height), the icon
 *    silently re-rasterizes at the wrong scale and clips/distorts.
 *  - Sibling pins cover orthogonal contracts on the same SVG:
 *      W1339 → span className="lobby-search-icon"
 *      W1633 → span aria-hidden="true"
 *      W1645 → inner svg width="16"
 *      W1646 → inner svg height="16"
 *    None inspect the SVG's coordinate-space `viewBox`, so a refactor
 *    that resizes the canvas slips through every existing assertion.
 *  - W625 / LobbyPage.test.tsx pins the drawer's `data-collapsed`
 *    initial value. This test fills the orthogonal SVG-viewBox gap.
 */
describe("LobbyPage — search icon inner SVG viewBox=0 0 24 24 (W2299)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the magnifier <svg> inside .lobby-search-icon with viewBox=\"0 0 24 24\"", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable input test id, then walk to the wrapper so
    // the icon lookup is independent of the attribute under test.
    const input = screen.getByTestId("lobby-search") as HTMLInputElement;
    const wrapper = input.parentElement as HTMLElement;
    expect(wrapper).not.toBeNull();

    const icon = wrapper.querySelector<HTMLElement>("span.lobby-search-icon");
    expect(icon).not.toBeNull();

    // The icon span wraps exactly one inline SVG (the magnifier glyph).
    const svg = icon!.querySelector("svg");
    expect(svg).not.toBeNull();

    // Pin the literal `viewBox="0 0 24 24"` attribute via the raw DOM
    // accessor — this fails on a missing attribute, on a different
    // coordinate space (e.g. "0 0 16 16" or "0 0 32 32"), and on any
    // CSS-only sizing that drops the attribute.
    expect(svg!.getAttribute("viewBox")).toBe("0 0 24 24");

    // Container is referenced to keep RTL's render handle alive across
    // any future Strict-Mode double-render audits.
    expect(container).toBeTruthy();
  });
});
