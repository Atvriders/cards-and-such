import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2416 — the decorative magnifier glyph in the lobby search wrapper
 * (`<span class="lobby-search-icon" aria-hidden="true">`) contains an
 * inline `<svg>` whose literal `stroke` attribute is `"currentColor"`.
 *
 * Why this needs its own pin:
 *  - The magnifier is rendered as an outline glyph that inherits its
 *    line colour from the surrounding text colour. The SVG sets
 *    `stroke="currentColor"` so that `<circle>` + `<path>` adopt the
 *    `.lobby-search-icon` colour. If the attribute is dropped, replaced
 *    with a fixed colour (e.g. `"#000"`), or flipped to `"none"`, the
 *    magnifier either turns invisible or stops following the theme.
 *  - Sibling pins cover orthogonal contracts on the same SVG:
 *      W1339 → span className="lobby-search-icon"
 *      W1633 → span aria-hidden="true"
 *      W1645 → svg width="16"
 *      W1654 → svg height="16"
 *      W2299 → svg viewBox="0 0 24 24"
 *      W2408 → svg fill="none"
 *    None inspect the SVG's `stroke` attribute, so a regression that
 *    breaks the colour inheritance slips through every existing pin.
 */
describe("LobbyPage — search icon inner SVG stroke=currentColor (W2416)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the magnifier <svg> inside .lobby-search-icon with stroke=\"currentColor\"", () => {
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

    // Pin the literal `stroke="currentColor"` attribute via the raw DOM
    // accessor — this fails on a missing attribute, on a fixed colour
    // (e.g. "#000", "black"), and on any CSS-only stroke that drops the
    // attribute.
    expect(svg!.getAttribute("stroke")).toBe("currentColor");

    // Container is referenced to keep RTL's render handle alive across
    // any future Strict-Mode double-render audits.
    expect(container).toBeTruthy();
  });
});
