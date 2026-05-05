import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2469 — the `chip-cards` button (the per-category chip emitted by the
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
 * Sibling coverage on the chip-strip:
 *   - W1962 (LobbyChipTag.test.tsx) pins `tagName === "BUTTON"` for every
 *     chip-* testid INCLUDING chip-cards.
 *   - W1424 (LobbyChipCardsBadge.test.tsx) pins the badge count text.
 *   - W1495 (LobbyChipCardsGlyphAria.test.tsx) pins the glyph
 *     `aria-hidden="true"` and the literal `♣` text.
 *   - W1258 (LobbyChipType.test.tsx) pins `type="button"` on chip-all
 *     ONLY — and even THAT test does not assert id-absence.
 *   - LobbyChipAllNoId / LobbyChipArrowLeftNoId / LobbyChipArrowRightNoId
 *     / LobbyChipDiceNoId / LobbyChipFavoritesNoId / LobbyChipHiddenNoId
 *     / LobbyChipTopRatedNoId pin id-absence for the OTHER chips, but
 *     the per-category `chip-cards` button itself has no such pin —
 *     even though it shares the same `Chip` helper output as the others.
 *     A refactor that special-cased the per-category chips (e.g. adding
 *     `id={`lobby-cat-${cat}`}` to wire up an `aria-controls` on a
 *     future tabpanel) would slip past every existing chip-cards test
 *     because none of W1962 / W1424 / W1495 read the `id` attribute.
 *
 * Per the W2469 dispatch directive: pin one untested attribute on the
 * `data-testid="chip-cards"` element. `id`-absence is the canonical
 * "negative" pin — it locks down the contract that this button is
 * resolved by `data-testid` ONLY, not by an id-based selector.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx)
 * follows the W1424 / W1495 / W1962 pattern so the test shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-cards has no id attribute (W2469)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the chip-cards button without an `id` attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-cards");

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
