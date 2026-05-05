import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2089 — the main catalog `<section aria-label="All games">` element
 * is rendered WITHOUT an `id` attribute. The section is identified for
 * assistive tech via its aria-label landmark name (pinned by W1200 in
 * LobbyAllGamesAria.test.tsx); it is not exposed as an in-page anchor
 * target.
 *
 * Why this needs its own pin:
 *  - Adding an `id` to this section (e.g. `id="all-games"` for deep
 *    linking, or an auto-generated `id` from a header-anchor plugin)
 *    would change document outline + URL fragment behaviour and can
 *    collide with section-head heading anchors elsewhere on the page.
 *  - No existing Lobby* test asserts the *absence* of the `id`
 *    attribute on this landmark, so a regression that introduces one
 *    would slip through silently.
 *
 * Sibling-file placement keeps this assertion isolated from churn in
 * LobbyPage.test.tsx and the other Lobby* sibling pins.
 */
describe("LobbyPage — All games section has no id attribute (W2089)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the All games <section> without an id attribute", () => {
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
    // Pin the literal absence of the `id` attribute. Using
    // hasAttribute() (not the .id property) guarantees we observe the
    // raw DOM attribute rather than the empty-string default that the
    // HTMLElement.id property bridge returns for unset ids.
    expect(section!.hasAttribute("id")).toBe(false);
  });
});
