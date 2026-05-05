import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2523 — pin the `aria-selected` default value on the LobbyPage
 * `data-testid="chip-board"` element on initial render.
 *
 * The chip-strip is rendered with `role="tablist"` and each chip is a
 * `role="tab"` button (see the `Chip` helper at LobbyPage.tsx ~L2651,
 * which serializes `<button role="tab" aria-selected={active}
 * aria-pressed={active} ...>`). Per the WAI-ARIA Authoring Practices
 * for tablist, each tab MUST advertise its selection state via
 * `aria-selected`. On a cold initial render with cleared
 * localStorage, the persisted filter falls back to `"all"`
 * (chip-all is the active tab), so `chip-board` — which is NOT the
 * active category — must serialize `aria-selected="false"` (React
 * stringifies the boolean for ARIA attributes).
 *
 * Why this needs its OWN per-chip pin:
 *  - LobbyChipBoardAriaPressedDefault (W2511) pins the SAME chip's
 *    `aria-pressed` default but does not read `aria-selected`. The
 *    Chip helper currently emits BOTH attributes; a regression that
 *    drops `aria-selected` while preserving `aria-pressed` (e.g.
 *    someone trimming what they think is a redundant ARIA prop, not
 *    realising the parent is a tablist that REQUIRES `aria-selected`
 *    per the ARIA Authoring Practices) would pass W2511 but break
 *    tablist semantics — this pin catches that.
 *  - LobbyChipCardsAriaSelectedDefault (W2509) pins the analogous
 *    default on the chip-cards sibling, not chip-board.
 *  - LobbyChipBoardBadge (W1433), LobbyChipBoardGlyphAria (W1499),
 *    LobbyChipBoardNoId (W2495), and LobbyChipBoardType (W2473) all
 *    fetch the chip-board button but each pins a different attribute
 *    (count text, glyph aria-hidden, id absence, type="button") and
 *    none of them reads `aria-selected`.
 *  - LobbyChipStripAria pins the parent tablist role/aria-label but
 *    NOT the per-tab `aria-selected` state on any individual chip.
 *
 * We resolve the chip via its stable `data-testid="chip-board"` (the
 * testId wired at LobbyPage.tsx via `testId={`chip-${cat}`}`) so the
 * lookup is locale-independent and immune to translation-key changes.
 * The assertion uses `getAttribute("aria-selected")` to read the
 * literal string attribute — not a JSX-coerced boolean — so the pin
 * captures the exact serialized value React emits when the chip is
 * inactive (`"false"`, not `null` or `"undefined"`). A regression
 * that drops the prop entirely (`getAttribute` → `null`), flips the
 * default to `"true"`, or accidentally inverts the JSX boolean fails
 * here.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx
 * or extending LobbyChipBoardAriaPressedDefault) mirrors the W2509 /
 * W2511 per-chip-attribute pattern so this shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to either mega-file.
 */
describe("LobbyPage — chip-board default aria-selected (W2523)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders chip-board with aria-selected=\"false\" on initial render (chip-all is active by default)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-board") as HTMLButtonElement;

    // Raw attribute check — `getAttribute` returns null when the
    // attribute is omitted, so a regression that drops the prop OR
    // flips the default to "true" fails here. We assert the literal
    // string "false" rather than a coerced boolean to catch JSX
    // serialization regressions.
    expect(chip.getAttribute("aria-selected")).toBe("false");
  });
});
