import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2799 — the chip-strip tablist track (`.lobby-chips`) MUST NOT carry
 * a `name` attribute. The track is the inner `<div role="tablist">`
 * rendered around line 2625 of LobbyPage.tsx, anchored externally via
 * its stable `className="lobby-chips"` and named for assistive tech by
 * a direct `aria-label="Filter by category"` (W1150).
 *
 * Sibling pins on this same `.lobby-chips` track:
 *   - W1908 / LobbyChipStripTag.test.tsx pins `tagName === "DIV"`.
 *   - W1150 / LobbyChipStripAria.test.tsx pins `aria-label` and `role`.
 *   - W2036 / LobbyChipStripNoId.test.tsx pins absence of `id`.
 *   - LobbyChipStripNoStyle / NoTabindex pin further attribute absences.
 *
 * What none of those cover is the ABSENCE of a `name` attribute on the
 * chip-strip track itself. `name` is meaningful on form-associated
 * elements (`input`, `select`, `button`, `form`, `iframe`, `map`, ...);
 * a stray `name` on a generic `<div role="tablist">` would silently:
 *   1. Suggest to readers that the tablist participates in form
 *      submission or is referenced by `<form>.elements.namedItem`,
 *      neither of which is true.
 *   2. Become a public, indexable string surface that ad-hoc selectors
 *      (`[name="..."]`) and assistive-tech heuristics could come to
 *      depend on, coupling future refactors to an attribute this
 *      codebase has deliberately not advertised.
 *   3. On a small subset of legacy ATs, prefer `name` over the
 *      explicit `aria-label`, undermining the intentional naming
 *      contract pinned in W1150.
 *
 * One focused assertion: the inner `.lobby-chips` track MUST NOT carry
 * a `name` attribute. If a future change deliberately needs one, it
 * should add the new `name` AND update this pin in the same commit,
 * making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W1150 / W1908 / W2036 pattern so the test shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-strip track has no name attribute (W2799)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .lobby-chips tablist track does NOT carry a name attribute", () => {
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

    // The actual contract: no `name` attribute on the chip-strip track.
    // Use `hasAttribute` rather than checking for an empty string —
    // a `name=""` would still be a (broken) public surface that future
    // code could come to depend on.
    expect(strip!.hasAttribute("name")).toBe(false);
  });
});
