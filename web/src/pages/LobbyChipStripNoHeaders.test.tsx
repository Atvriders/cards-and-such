import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2905 — the chip-strip tablist track (`.lobby-chips`) MUST NOT carry
 * a `headers` attribute. The `headers` attribute is a table-cell
 * association attribute (`<td>`/`<th>` referencing one or more header
 * cell ids) and is not meaningful on a `<div role="tablist">`. The
 * track is the inner `<div role="tablist">` rendered around line
 * 2623-2630 of LobbyPage.tsx, anchored externally via its stable
 * `className="lobby-chips"` and named for assistive tech by a direct
 * `aria-label="Filter by category"` (W1150).
 *
 * Sibling pins on this same `.lobby-chips` track:
 *   - W1908 / LobbyChipStripTag.test.tsx pins `tagName === "DIV"`.
 *   - W1150 / LobbyChipStripAria.test.tsx pins `aria-label` and `role`.
 *   - W2036 / LobbyChipStripNoId.test.tsx pins absence of `id`.
 *   - LobbyChipStripChildCount.test.tsx pins exact direct child count.
 *   - LobbyChipStripWrap.test.tsx pins the outer wrapper structure.
 *
 * What none of those cover is the ABSENCE of a `headers` attribute on
 * the chip-strip track itself. A future refactor that introduced
 * `headers="..."` would silently:
 *   1. Misuse a table-cell association attribute on a non-cell element,
 *      producing invalid HTML that some validators flag and that
 *      assistive technology may either ignore or surface confusingly.
 *   2. Imply a tabular relationship (header-cell association) that the
 *      chip-strip emphatically does not have — it is a tablist, not a
 *      data table.
 *   3. Couple the chip-strip to the ids of unrelated elements elsewhere
 *      on the page, making those ids load-bearing for the chip-strip's
 *      semantics in a way the codebase has deliberately not advertised.
 *
 * One focused assertion: the inner `.lobby-chips` track MUST NOT carry
 * a `headers` attribute. If a future change deliberately needs one
 * (which would be a strong signal something has gone wrong), it should
 * add the new `headers` AND update this pin in the same commit, making
 * the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W1150 / W1908 / W2036 pattern so the test shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-strip track has no headers attribute (W2905)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .lobby-chips tablist track does NOT carry a headers attribute", () => {
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
    // className) or the outer `.lobby-chips-wrap`. Without this guard a
    // future restructure that moved the className onto a wrapper could
    // pass this assertion vacuously.
    expect(strip!.tagName).toBe("DIV");
    expect(strip!.getAttribute("role")).toBe("tablist");

    // The actual contract: no `headers` attribute on the chip-strip
    // track. Use `hasAttribute` rather than checking for an empty
    // string — a `headers=""` would still be a (broken) public surface
    // that future code could come to depend on.
    expect(strip!.hasAttribute("headers")).toBe(false);
  });
});
