import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2170 — the main catalog `<section aria-label="All games">` element
 * is rendered WITHOUT an inline `style` attribute. All visual styling
 * for this landmark must come from CSS (class-based selectors), never
 * from inline style props injected at render time.
 *
 * Why this needs its own pin:
 *  - An inline `style` attribute on the All games section would couple
 *    layout/theming to component logic, defeating the design-system
 *    CSS that targets the section via its tag + landmark structure.
 *  - It would also break dark/light theme overrides and responsive
 *    rules that rely on cascade specificity rather than inline
 *    declarations (which trump everything but `!important`).
 *  - No existing Lobby* test asserts the *absence* of the `style`
 *    attribute on this landmark, so a regression that introduces one
 *    (e.g. ad-hoc `style={{ marginTop: 12 }}`) would slip through
 *    silently.
 *
 * Sibling-file placement keeps this assertion isolated from churn in
 * LobbyPage.test.tsx and the other Lobby* sibling pins (notably
 * LobbyAllGamesAria.test.tsx and LobbyAllGamesNoId.test.tsx).
 */
describe("LobbyPage — All games section has no style attribute (W2170)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the All games <section> without an inline style attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const section = document.querySelector<HTMLElement>(
      'section[aria-label="All games"]',
    );
    expect(section).not.toBeNull();
    expect(section!.tagName).toBe("SECTION");
    // Pin the literal absence of the `style` attribute. Using
    // hasAttribute() (not the .style property) guarantees we observe
    // the raw DOM attribute rather than the always-present
    // CSSStyleDeclaration object that HTMLElement.style exposes even
    // when no inline styles have been declared.
    expect(section!.hasAttribute("style")).toBe(false);
  });
});
