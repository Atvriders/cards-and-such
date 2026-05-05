import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2228 — the chip-strip tablist track (`.lobby-chips`) MUST NOT carry
 * a `tabindex` attribute. The track is the inner `<div role="tablist">`
 * rendered around line 2623-2630 of LobbyPage.tsx. The individual chips
 * inside it manage their own focus via the standard tablist roving-
 * tabindex pattern, so the container itself is intentionally not part
 * of the page's tab order.
 *
 * Sibling pins on the same `.lobby-chips` track already cover other
 * attribute-shape contracts:
 *   - W1908 / LobbyChipStripTag.test.tsx pins `tagName === "DIV"`.
 *   - W1150 / LobbyChipStripAria.test.tsx pins `aria-label` and `role`.
 *   - W2036 / LobbyChipStripNoId.test.tsx pins absence of `id`.
 *   - LobbyChipStripNoStyle.test.tsx pins absence of inline `style`.
 *   - LobbyChipStripChildCount.test.tsx pins exact direct child count.
 *
 * What none of those cover is the ABSENCE of a `tabindex` attribute on
 * the chip-strip track itself. The two sibling overflow arrow buttons
 * each have `tabIndex={-1}` (pinned by LobbyChipArrowLeftTabIndex and
 * LobbyChipArrowRightTabIndex) — but the `.lobby-chips` track between
 * them has no tabindex of any kind, and that is the contract. A future
 * refactor that added e.g. `tabIndex={0}` would silently:
 *   1. Insert the entire chip-strip container into the keyboard tab
 *      order BEFORE its chip children, so a user pressing Tab would
 *      land on the empty wrapper before reaching any actionable chip.
 *   2. Conflict with the existing roving-tabindex contract on the chip
 *      children — the WAI-ARIA tablist pattern expects exactly one
 *      tab stop inside the tablist, and that stop should be the
 *      currently-active tab, not the tablist element itself.
 *   3. Or, with `tabIndex={-1}`, make the container programmatically
 *      focusable (`element.focus()` would succeed) and create a new
 *      undeclared focus surface that screen-reader scripts and tests
 *      could come to rely on.
 *
 * One focused assertion: the `.lobby-chips` tablist track MUST NOT
 * carry a `tabindex` attribute at all. If a future change deliberately
 * needs one, it should add it AND update this pin in the same commit,
 * making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W1150 / W1908 / W2036 pattern so the test shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-strip track has no tabindex attribute (W2228)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .lobby-chips tablist track does NOT carry a tabindex attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable className. querySelector (rather than
    // getByRole) avoids ambiguity with the sibling drawer tablist that
    // shares role="tablist", and the className itself is independent of
    // the attribute under test.
    const strip = document.querySelector<HTMLElement>(".lobby-chips");
    expect(strip).not.toBeNull();

    // Sanity: confirm we pinned the inner track and not, say, a
    // `.lobby-chips-arrow` overflow button (which has the chained
    // className and DOES carry `tabindex="-1"`) or the outer
    // `.lobby-chips-wrap`. Without this guard a future restructure
    // that moved the className onto a wrapper could pass this
    // assertion vacuously.
    expect(strip!.tagName).toBe("DIV");
    expect(strip!.getAttribute("role")).toBe("tablist");

    // The actual contract: no `tabindex` attribute on the chip-strip
    // track. Use `hasAttribute` rather than checking for a specific
    // value — even `tabindex="-1"` would make the container
    // programmatically focusable and create a new undeclared focus
    // surface.
    expect(strip!.hasAttribute("tabindex")).toBe(false);
  });
});
