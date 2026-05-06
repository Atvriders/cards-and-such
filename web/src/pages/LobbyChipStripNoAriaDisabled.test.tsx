import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2769 — the chip-strip tablist track (`.lobby-chips`) MUST NOT carry
 * an `aria-disabled` attribute. The track is the inner
 * `<div role="tablist">` rendered around line 2623-2630 of LobbyPage.tsx
 * which currently exposes only `className`, `role="tablist"`, and
 * `aria-label="Filter by category"` to assistive tech.
 *
 * Sibling pins on the same `.lobby-chips` track already cover other
 * attribute-shape contracts:
 *   - W1908 / LobbyChipStripTag.test.tsx pins `tagName === "DIV"`.
 *   - W1150 / LobbyChipStripAria.test.tsx pins `aria-label` and `role`.
 *   - W2036 / LobbyChipStripNoId.test.tsx pins absence of `id`.
 *   - W2228 / LobbyChipStripNoTabindex.test.tsx pins absence of
 *     `tabindex`.
 *   - LobbyChipStripNoStyle.test.tsx pins absence of inline `style`.
 *   - LobbyChipStripNoAriaOrientation.test.tsx pins absence of
 *     `aria-orientation`.
 *
 * What none of those cover is the ABSENCE of an `aria-disabled`
 * attribute on the chip-strip track itself. The individual chip
 * <button>s inside the track each carry their own `aria-pressed` /
 * `aria-selected` semantics, and disabling the entire tablist via
 * `aria-disabled="true"` (or even `aria-disabled="false"`) on the
 * container would silently:
 *   1. Mark the tablist — and by ARIA inheritance every chip inside
 *      it — as disabled to assistive tech, even when the chips
 *      themselves remain interactive in the DOM. Screen readers would
 *      announce the entire filter strip as unavailable while sighted
 *      users see and can still click the chips.
 *   2. Conflict with the WAI-ARIA tablist pattern, which has no
 *      `aria-disabled` semantics at the container level — the spec
 *      places that attribute on individual `tab` children when a
 *      single tab needs to be disabled.
 *   3. Even `aria-disabled="false"` is harmful: it's a non-default
 *      explicit assertion that creates a permanent attribute surface
 *      a future refactor could come to depend on, and some screen
 *      readers (notably older NVDA builds) announce `false` as a
 *      state change on focus.
 *
 * One focused assertion: the `.lobby-chips` tablist track MUST NOT
 * carry an `aria-disabled` attribute at all. Use `hasAttribute`
 * rather than checking for a specific value — the contract is
 * absence, not "absence-or-false".
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W1150 / W1908 / W2036 / W2228 pattern so the test
 * shares the `src/pages/Lobby` vitest path filter without colliding
 * with concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-strip track has no aria-disabled attribute (W2769)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .lobby-chips tablist track does NOT carry an aria-disabled attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable className. querySelector (rather than
    // getByRole) avoids ambiguity with the sibling drawer tablist that
    // shares role="tablist", and the className itself is independent
    // of the attribute under test.
    const strip = document.querySelector<HTMLElement>(".lobby-chips");
    expect(strip).not.toBeNull();

    // Sanity: confirm we pinned the inner track and not, say, a
    // `.lobby-chips-arrow` overflow button (which has the chained
    // className) or the outer `.lobby-chips-wrap`. Without this guard
    // a future restructure that moved the className onto a wrapper
    // could pass this assertion vacuously.
    expect(strip!.tagName).toBe("DIV");
    expect(strip!.getAttribute("role")).toBe("tablist");

    // The actual contract: no `aria-disabled` attribute on the
    // chip-strip track. Use `hasAttribute` rather than checking for
    // a specific value — even `aria-disabled="false"` would create
    // an undeclared semantic surface and could be announced as a
    // state by some screen readers.
    expect(strip!.hasAttribute("aria-disabled")).toBe(false);
  });
});
