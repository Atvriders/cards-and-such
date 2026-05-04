import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1645 — the decorative magnifier glyph in the lobby search wrapper
 * (`<span class="lobby-search-icon" aria-hidden="true">`) contains an
 * inline `<svg>` whose literal `width` attribute is `"16"`.
 *
 * Why this needs its own pin:
 *  - The 16px square is what allows the icon to fit inside the input's
 *    left padding without overflow or layout shift. A bump to "20" or
 *    "24" silently bleeds the magnifier into the typed-text area.
 *  - Sibling pins cover orthogonal contracts on the same span:
 *      W1339 → span className="lobby-search-icon"
 *      W1633 → span aria-hidden="true"
 *    Neither inspects the inner <svg> sizing, so a regression that
 *    re-sizes the magnifier slips through every existing assertion.
 */
describe("LobbyPage — search icon inner SVG width (W1645)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the magnifier <svg> inside .lobby-search-icon with width=\"16\"", () => {
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

    // Pin the literal `width="16"` attribute via the raw DOM accessor —
    // this fails on a missing attribute, on a non-"16" value (e.g. "20"
    // or "24"), and on any CSS-only sizing that drops the attribute.
    expect(svg!.getAttribute("width")).toBe("16");

    // Container is referenced to keep RTL's render handle alive across
    // any future Strict-Mode double-render audits.
    expect(container).toBeTruthy();
  });
});
