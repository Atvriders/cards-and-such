import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2802 — the chip-strip tablist track (`.lobby-chips`) MUST NOT carry
 * a `value` attribute. The track is the inner `<div role="tablist">`
 * rendered around line 2623-2630 of LobbyPage.tsx, anchored externally
 * via its stable `className="lobby-chips"` and named for assistive tech
 * by a direct `aria-label="Filter by category"` (W1150).
 *
 * Sibling pins on this same `.lobby-chips` track:
 *   - W1908 / LobbyChipStripTag.test.tsx pins `tagName === "DIV"`.
 *   - W1150 / LobbyChipStripAria.test.tsx pins `aria-label` and `role`.
 *   - W2036 / LobbyChipStripNoId.test.tsx pins absence of `id`.
 *   - LobbyChipStripNoStyle / NoTabindex / NoAria* pin other absences.
 *
 * What none of those cover is the ABSENCE of a `value` attribute on
 * the chip-strip track itself. `value` is a meaningful attribute on
 * <input>, <button>, <option>, <li>, <param>, <meter>, and <progress>
 * elements; on a plain `<div>` it is ignored by browsers but a future
 * refactor that introduced e.g. `value="all"` (perhaps when migrating
 * the track to a `<fieldset>` or to a custom element) would silently:
 *   1. Suggest the track is a form-control-like surface that carries
 *      a current selection value, when in fact selection is tracked
 *      by per-chip `aria-pressed` / `aria-selected` state.
 *   2. Be exposed in DOM serialization (outerHTML, snapshot fixtures,
 *      analytics scrapers) as if the lobby exported a stable
 *      "current category" value — turning an internal detail into an
 *      undeclared public contract.
 *   3. Confuse accessibility tools and querySelector(`[value]`) call
 *      sites that assume `value` lives only on form controls.
 *
 * One focused assertion: the inner `.lobby-chips` track MUST NOT carry
 * a `value` attribute. If a future change deliberately needs one, it
 * should add the new `value` AND update this pin in the same commit,
 * making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W1150 / W1908 / W2036 pattern so the test shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-strip track has no value attribute (W2802)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .lobby-chips tablist track does NOT carry a value attribute", () => {
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

    // The actual contract: no `value` attribute on the chip-strip track.
    // Use `hasAttribute` rather than checking for an empty string —
    // a `value=""` would still be a (broken) public surface that future
    // code could come to depend on.
    expect(strip!.hasAttribute("value")).toBe(false);
  });
});
