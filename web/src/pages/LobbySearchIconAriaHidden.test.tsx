import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1633 — the decorative magnifier glyph next to the lobby search input
 * (`<span class="lobby-search-icon" aria-hidden="true">…`) carries the
 * literal `aria-hidden="true"` attribute.
 *
 * Why this needs its own pin:
 *  - The icon is purely decorative — the adjacent `<input aria-label=
 *    "Search games">` already conveys the intent to assistive tech. If
 *    the icon span loses `aria-hidden`, screen readers will announce
 *    its inner SVG content (or a stray empty group) twice, polluting
 *    the search experience.
 *  - Sibling pins cover orthogonal contracts:
 *      W1339 → className="lobby-search-icon" (CSS hook)
 *      W1143 → aria-label="Search games" on the input
 *      W912  → input type="search" / role="searchbox"
 *    None of those locate the icon span and assert on its
 *    `aria-hidden` attribute, so a regression that drops the
 *    accessibility hint slips through every existing test.
 */
describe("LobbyPage — search icon aria-hidden (W1633)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the search-adjacent magnifier glyph with aria-hidden=\"true\"", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable input test id, then walk to the wrapper
    // so the icon lookup is independent of the attribute under test.
    const input = screen.getByTestId("lobby-search") as HTMLInputElement;
    const wrapper = input.parentElement as HTMLElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper.classList.contains("lobby-search")).toBe(true);

    // The icon span lives as a sibling of the input within the wrapper.
    const icon = wrapper.querySelector<HTMLElement>("span.lobby-search-icon");
    expect(icon).not.toBeNull();

    // Pin the literal `aria-hidden="true"` attribute via the raw DOM
    // accessor — this fails on a missing attribute, on `aria-hidden=
    // "false"`, and on any non-string value coerced by React.
    expect(icon!.getAttribute("aria-hidden")).toBe("true");

    // Cross-check via the property accessor to guard against future
    // React versions that might omit the attribute when prop value is
    // a boolean rather than a string literal.
    expect(icon!.hasAttribute("aria-hidden")).toBe(true);

    // Container is referenced to keep RTL's render handle alive across
    // any future Strict-Mode double-render audits.
    expect(container).toBeTruthy();
  });
});
