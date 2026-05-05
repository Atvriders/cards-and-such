import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2485 — the `chip-recently-played` button (emitted by the shared
 * `Chip` helper at LobbyPage.tsx ~L2651-2666) MUST NOT carry an `id`
 * attribute. The production JSX threads only `type`, `role`,
 * `aria-selected`, `aria-pressed`, `className`, `onClick`, and
 * `data-testid` through the underlying `<button>`; an `id` would be
 * load-bearing for `<label for=…>` / `aria-labelledby` / `aria-controls`
 * wiring elsewhere in the lobby DOM, and silently introducing one would
 * pollute the document-wide id namespace (the lobby renders ~10 chips on
 * every mount — duplicate ids if a regression copy-pasted a static
 * value).
 *
 * Sibling coverage on chip-recently-played specifically:
 *   - W1962 (LobbyChipTag.test.tsx) pins `tagName === "BUTTON"` for the
 *     chip-recently-played testid in the chip-strip sweep.
 *   - W1462 (LobbyChipRecentGlyphAria.test.tsx) pins the glyph span's
 *     `aria-hidden="true"` and the literal `↺` text content.
 *   - W1175 (LobbyRecentlyPlayedChipBadgeZero.test.tsx) pins the badge
 *     count text on a fresh-mount empty `cards-last-played` localStorage.
 *   - W2464 (LobbyChipRecentlyPlayedType.test.tsx) pins the explicit
 *     `type="button"` attribute.
 *   - LobbyPage.test.tsx ~L2182 pins `aria-pressed` toggling on click.
 *   - LobbyRecentlyPlayedOrder.test.tsx pins `aria-pressed` after a
 *     filter-driven reorder.
 *
 * What none of those existing pins assert: the absence of an `id`
 * attribute on this specific chip. Sibling NoId tests cover other
 * chips — LobbyChipAllNoId, LobbyChipArrowLeftNoId, LobbyChipArrowRightNoId,
 * LobbyChipCardsNoId, LobbyChipDiceNoId, LobbyChipFavoritesNoId,
 * LobbyChipHiddenNoId, LobbyChipTopRatedNoId — but `chip-recently-played`
 * itself has no such pin, even though it shares the same `Chip` helper
 * output. A refactor that special-cased recently-played (e.g. adding
 * `id="lobby-chip-recently-played"` to wire up an aria-controls on a
 * future "recent activity" tabpanel) would slip past every existing
 * chip-recently-played test because none of W1962 / W1462 / W1175 / W2464
 * reads the `id` attribute.
 *
 * Per the W2485 dispatch directive: pin one untested attribute on the
 * `data-testid="chip-recently-played"` element. `id`-absence is the
 * canonical "negative" pin — it locks down the contract that this button
 * is resolved by `data-testid` ONLY, not by an id-based selector.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx)
 * follows the W2469 / W1462 / W1175 / W2464 pattern so the test shares
 * the `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-recently-played has no id attribute (W2485)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the chip-recently-played button without an `id` attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-recently-played");

    // The Chip helper (LobbyPage.tsx ~L2651-2666) does NOT thread an
    // `id` onto the underlying button. `hasAttribute` returns false for
    // an omitted attribute — a regression that adds `id={…}` to the JSX
    // (or copy-pastes a static id) flips this to true and fails the
    // assertion.
    expect(chip.hasAttribute("id")).toBe(false);

    // Belt-and-braces: the IDL `id` property normalises to "" when the
    // attribute is absent. Reading the property catches the same
    // regression from a second angle (e.g. a refactor that set the id
    // imperatively via a ref, which would NOT show up as an HTML
    // attribute but WOULD reflect on the DOM property).
    expect(chip.id).toBe("");
  });
});
