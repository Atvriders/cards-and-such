import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2559 — the LobbyPage `chip-favorites` Chip <button> MUST carry
 * `role="tab"` exactly. The Chip helper (LobbyPage.tsx ~L2651-2666) emits
 * the following props on its <button> wrapper:
 *
 *     <button
 *       type="button"
 *       role="tab"
 *       aria-selected={active}
 *       aria-pressed={active}
 *       className={`lobby-chip${active ? " is-active" : ""}`}
 *       onClick={onClick}
 *       data-testid={testId}
 *     >…</button>
 *
 * The `role="tab"` attribute is load-bearing: combined with the parent
 * `<ChipStrip>`'s `role="tablist"` (LobbyPage.tsx ~L2540-…) it forms the
 * ARIA tab pattern that screen readers announce as "tab, selected" /
 * "tab, not selected" using the sibling `aria-selected={active}`. A
 * regression that dropped or mis-spelled `role` (e.g. `role="button"`,
 * `role="tabpanel"`, or omitting it entirely so the implicit
 * <button> role surfaced) would silently:
 *   1. Break the AT announcement contract — users would hear "button"
 *      instead of "tab, X of Y", losing the positional context that
 *      makes the chip-strip navigable as a tablist.
 *   2. Decouple the chip from the parent `role="tablist"`, since a
 *      tablist's children must be `role="tab"` to satisfy the WAI-ARIA
 *      authoring practice; mixed roles inside a tablist are an
 *      accessibility-tree anti-pattern.
 *   3. Cause keyboard-arrow roving-tabindex helpers (which key off
 *      `[role="tab"]`) to skip the favorites chip, leaving it
 *      reachable only by Tab — a subtle UX regression.
 *
 * Why this needs its OWN per-chip pin on chip-favorites specifically:
 *  - LobbyPage.test.tsx W267/W649 pins `aria-pressed` on chip-favorites
 *    (both default-mount "false" and post-click "true"), and the
 *    drawer-row test at LobbyPage.test.tsx ~L326 pins
 *    `role="tab"` on `lobby-drawer-cat-all` — a DIFFERENT element
 *    (the drawer category-row, NOT the chip-strip favorites chip).
 *    No existing test reads `getAttribute("role")` on
 *    `data-testid="chip-favorites"`.
 *  - W2483 (LobbyChipFavoritesType.test.tsx) pins the `type="button"`
 *    attribute, W2450 (LobbyChipFavoritesNoId.test.tsx) pins the `id`
 *    absence, W2531 (LobbyChipFavoritesNoStyle.test.tsx) pins the
 *    `style` absence, W1470 (LobbyChipFavoritesGlyphAria.test.tsx) pins
 *    the glyph and its `aria-hidden`, W1158
 *    (LobbyFavoritesChipBadgeZero.test.tsx) pins the count-badge text
 *    on a fresh mount — but NONE of these read the `role` attribute.
 *  - chip-favorites is rendered through the *static* JSX branch at
 *    LobbyPage.tsx ~L1943-1949 (not the `CATEGORY_ORDER.map` dynamic
 *    branch), so a regression that special-cased the favorites JSX
 *    (e.g. inlined a custom <button role="button"> for the favorites
 *    chip without going through the shared Chip helper) would silently
 *    drop `role="tab"` on chip-favorites alone while every other chip
 *    continued to satisfy a hypothetical cross-chip role pin.
 *
 * Resolves the chip via its stable `data-testid="chip-favorites"`
 * (rendered through `testId="chip-favorites"` at LobbyPage.tsx ~L1947)
 * so the lookup is locale-independent and immune to translation-key
 * changes. The assertion uses `getAttribute("role")` to read the
 * literal markup attribute — the implicit role of a <button> would NOT
 * surface here, so a missing attribute is correctly caught.
 */
describe("LobbyPage — chip-favorites role attribute (W2559)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders chip-favorites with an explicit role=\"tab\" attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-favorites");

    // Sanity: confirm we pinned the actual chip-favorites <button>
    // wrapper and not a child span. The Chip helper emits a <button>,
    // and going through `data-testid="chip-favorites"` would resolve a
    // child element if any future refactor moved the testid down onto
    // an inner span — which would itself be a regression.
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: explicit `role="tab"`. Use
    // `getAttribute("role")` to read the literal markup attribute —
    // the implicit role of a <button> is "button" and would NOT
    // satisfy this read, so a regression that removed the attribute
    // would correctly fail rather than silently passing on the
    // implicit role.
    expect(chip.getAttribute("role")).toBe("tab");
  });
});
