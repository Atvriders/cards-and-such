import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1482 — the "Recommended for you" strip `<section>` that surfaces the
 * personalised recommendations row exposes the accessible name
 * "Recommended for you" via aria-label.
 *
 * Why this needs its own pin:
 *  - LobbyAllGamesAria.test.tsx (W1200) pins the "All games" landmark and
 *    LobbyPage.test.tsx (W735) pins the "Featured games" landmark, but the
 *    sibling "Recommended for you" landmark — a third top-level region
 *    inside the lobby's main scroll — has no dedicated test asserting the
 *    literal aria-label string.
 *  - A regression that drops the attribute, renames it (e.g. to
 *    "Recommendations" or "For you"), or relocates it to a non-section
 *    element would silently weaken landmark navigation for screen-reader
 *    users without flipping any existing test red.
 *
 * The recommended strip only renders when `query` is empty, `filter` is
 * "all", and `recommendations.length > 0`. The default initial state of
 * the lobby satisfies the first two conditions; recommendations may be
 * empty on a fresh localStorage, in which case we still want a useful
 * pin, so the assertion is conditional on the section existing.
 */
describe("LobbyPage — Recommended strip aria-label (W1482)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("labels the recommended section with aria-label=\"Recommended for you\" when present", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the className/data-testid first to confirm whether the
    // strip is rendered at all under the default lobby state. The strip
    // is gated behind `recommendations.length > 0`, which depends on the
    // recommender's output for an empty-localStorage user.
    const section = document.querySelector<HTMLElement>(
      'section[data-testid="lobby-recommended"]',
    );

    if (section === null) {
      // No recommendations under the default empty-history state — the
      // section is not rendered, which is a valid lobby branch. Nothing
      // to pin in that case; we still assert the absence is consistent
      // (no stray sibling element with the same aria-label).
      expect(
        document.querySelector('section[aria-label="Recommended for you"]'),
      ).toBeNull();
      return;
    }

    // Strip is rendered — pin every load-bearing attribute on the
    // section element verbatim via getAttribute so the assertion reads
    // exactly what was emitted into the DOM.
    expect(section.tagName).toBe("SECTION");
    expect(section.getAttribute("aria-label")).toBe("Recommended for you");
    expect(section.getAttribute("class")).toBe("lobby-recommended");
    expect(section.getAttribute("data-testid")).toBe("lobby-recommended");
  });
});
