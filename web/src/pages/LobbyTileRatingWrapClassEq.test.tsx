import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1630 — the lobby tile-rating wrapper's `className` is *exactly*
 * `"tile-rating"` — no extra tokens, no whitespace padding.
 *
 * Sibling tests pin adjacent attributes of the SAME wrapper:
 *   - W682  (LobbyPage.test.tsx): the wrapper's aria-label copy.
 *   - W1370 (LobbyTileRatingTag.test.tsx): tagName + `toHaveClass`
 *           membership (`"tile-rating"` is *among* the classes).
 *   - W1618 (LobbyTileRatingWrapStyle.test.tsx): no inline `style` attr.
 *
 * `toHaveClass` only asserts membership — a regression that did
 *   className={`tile-rating ${flagged ? "tile-rating--hot" : ""}`}
 * would still pass W1370 even though the wrapper now carries an
 * un-styled trailing token (LobbyPage.css has no `tile-rating--hot`
 * rule). Pinning `.className === "tile-rating"` catches any such
 * accidental token addition AND guards against trailing whitespace
 * from a JSX template-literal slip.
 *
 * Standalone (non-family) game `pool-10ball` is reused from W951 /
 * W1262 / W1370 so the inner-rating query stays unambiguous.
 */
describe("LobbyPage — tile-rating wrapper className equals exactly \"tile-rating\" (W1630)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("wrapper.className is the exact string \"tile-rating\" (no extra tokens)", async () => {
    // Seed a stored rating BEFORE mount so the page's useState initializer
    // hydrates synchronously via readRatings() (LobbyPage.tsx ~L732).
    localStorage.setItem(
      "cards-ratings",
      JSON.stringify({ "pool-10ball": 3 }),
    );

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const ratingWidget = await screen.findByTestId("tile-rating-pool-10ball");

    // Exact-equality contract: any drift (e.g. "tile-rating tile-rating--hot",
    // "tile-rating ", " tile-rating") indicates an unintended token was
    // appended to the wrapper's className.
    expect(ratingWidget.className).toBe("tile-rating");
  });
});
