import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2197 — pin the ABSENCE of an `aria-hidden` attribute on the lobby
 * tile's `tile-difficulty-<id>` chip span itself.
 *
 * Each tile renders the difficulty chip at LobbyPage.tsx ~L2743:
 *
 *   <span
 *     className={`tile-chip tile-chip-diff tile-chip-diff-${difficulty}`}
 *     data-testid={`tile-difficulty-${gameId}`}
 *     aria-label={`Difficulty: ${difficulty}`}
 *     title={`Difficulty: ${difficulty}`}
 *   >
 *     {[1, 2, 3].map((i) => (
 *       <span className="tile-chip-dot…" aria-hidden="true" />
 *     ))}
 *   </span>
 *
 * The chip itself carries an `aria-label` so AT users hear
 * "Difficulty: <level>"; only the three decorative dot spans inside
 * are marked `aria-hidden="true"`. The wrapping `.tile-chips` parent
 * carries `aria-hidden="false"` (pinned by W1397). Adding
 * `aria-hidden` to the chip here would silence the entire difficulty
 * announcement (because `aria-hidden` propagates to descendants),
 * making the `aria-label` invisible to screen readers.
 *
 * Sibling tests pin tile-difficulty `aria-label` (W1478), `title`
 * (LobbyTileDiffTitle), tag (LobbyTileDiffTag), exact className
 * (W1652), absence of `id` (W2076), absence of `style` (W2147), and
 * the inner-dot `aria-hidden="true"` (W1577). None of them assert the
 * chip-element's OWN `aria-hidden` attribute is absent — grepping
 * `web/src/pages/Lobby*.test.tsx` for `tile-difficulty` paired with
 * `aria-hidden` / `hasAttribute("aria-hidden")` returns only the
 * inner-dot test (`tile-chip-dot`, not the chip itself), leaving this
 * accessibility invariant unprotected.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W2076 / W2147 / W1478: shares the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits to the
 * mega-file.
 */
describe("LobbyPage — tile-difficulty chip has no aria-hidden (W2197)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the tile-difficulty chip without an `aria-hidden` attribute", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    const chip = document.querySelector<HTMLElement>(
      '[data-testid^="tile-difficulty-"]',
    );
    expect(chip, "expected at least one tile-difficulty chip").not.toBeNull();

    // The chip itself MUST NOT carry `aria-hidden`. Adding it (with any
    // value) would propagate to the inner dots and silence the
    // `aria-label="Difficulty: <level>"` for screen-reader users.
    expect(chip!.hasAttribute("aria-hidden")).toBe(false);
    expect(chip!.getAttribute("aria-hidden")).toBeNull();
  });
});
