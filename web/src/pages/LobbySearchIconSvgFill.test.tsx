import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2408 — the decorative magnifier glyph in the lobby search wrapper
 * (`<span class="lobby-search-icon" aria-hidden="true">`) contains an
 * inline `<svg>` whose literal `fill` attribute is `"none"`.
 *
 * Why this needs its own pin:
 *  - The magnifier is rendered as an outline glyph: the `<circle>` and
 *    `<path>` use `stroke="currentColor"` only and rely on `fill="none"`
 *    on the parent SVG to stay hollow. If the attribute is dropped or
 *    flipped to a coloured value (e.g. `"currentColor"` or `"#000"`),
 *    the magnifier silently fills in as a solid disc + bar, completely
 *    obscuring the outline shape.
 *  - Sibling pins cover orthogonal contracts on the same SVG:
 *      W1339 → span className="lobby-search-icon"
 *      W1633 → span aria-hidden="true"
 *      W1645 → svg width="16"
 *      W1654 → svg height="16"
 *      W2299 → svg viewBox="0 0 24 24"
 *    None inspect the SVG's `fill` attribute, so a regression that
 *    fills in the magnifier slips through every existing assertion.
 */
describe("LobbyPage — search icon inner SVG fill=none (W2408)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the magnifier <svg> inside .lobby-search-icon with fill=\"none\"", () => {
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

    // Pin the literal `fill="none"` attribute via the raw DOM accessor —
    // this fails on a missing attribute, on a coloured fill (e.g.
    // "currentColor", "#000", "black"), and on any CSS-only fill that
    // drops the attribute.
    expect(svg!.getAttribute("fill")).toBe("none");

    // Container is referenced to keep RTL's render handle alive across
    // any future Strict-Mode double-render audits.
    expect(container).toBeTruthy();
  });
});
