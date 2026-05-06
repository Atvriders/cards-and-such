import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2795 — the LobbyPage `.lobby-chips` chip-strip <div> MUST NOT carry
 * an `aria-readonly` attribute.
 *
 * Source surface (LobbyPage.tsx ~L2623-2630):
 *
 *     <div
 *       ref={trackRef}
 *       className="lobby-chips"
 *       role="tablist"
 *       aria-label="Filter by category"
 *     >
 *       {children}
 *     </div>
 *
 * Per WAI-ARIA, `aria-readonly` is only meaningful on editable widgets
 * (textbox, checkbox, combobox, grid, gridcell, listbox, radiogroup,
 * spinbutton, slider, switch, tree, treegrid, columnheader, rowheader).
 * `role="tablist"` is NOT in that set — it is a navigation surface, not
 * an editable form control. Adding `aria-readonly` here would:
 *
 *   1. Lie to assistive tech by implying the chip strip is some kind of
 *      editable control whose edits are merely suppressed.
 *   2. Be ignored by spec-conformant ATs but still registered by
 *      attribute-driven snapshot tooling, fuzzers, and a11y linters as
 *      a (silent) authoring error.
 *   3. Couple this navigation tablist to widgets whose `aria-readonly`
 *      semantics this codebase pins separately (e.g. W2792 for the
 *      stats cat heatmap grid). Mirroring that contract onto a tablist
 *      would conflate two unrelated ARIA surfaces.
 *
 * Sibling pins on `.lobby-chips` cover other absences/presences but NOT
 * `aria-readonly` absence — none of the existing chip-strip / chip-all
 * tests in this directory assert against `aria-readonly` on the strip
 * container itself. This file closes that gap, mirroring the
 * StatsCatHeatmapNoAriaReadonly (W2792) pattern but for the lobby
 * chip-strip tablist.
 *
 * Resolves the strip via `document.querySelector(".lobby-chips")` so
 * the assertion is locale-independent and immune to translation-key
 * or aria-label changes.
 */
describe("LobbyPage — .lobby-chips strip has no aria-readonly attribute (W2795)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .lobby-chips <div> does NOT carry an aria-readonly attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const strip = document.querySelector(".lobby-chips");

    // Sanity: the chip-strip surface must actually be present in the
    // rendered tree — otherwise a future refactor that renamed the
    // class could silently turn this into a vacuous pass.
    expect(strip).not.toBeNull();

    // The actual contract: no `aria-readonly` attribute on the strip.
    // Use `hasAttribute` rather than checking for null/empty — an
    // `aria-readonly=""` would still be a (broken) public ARIA surface
    // that attribute-driven tooling could come to mis-handle, and
    // `getAttribute("aria-readonly")` returning "" would silently pass
    // a `.toBeFalsy()` style assertion.
    expect(strip!.hasAttribute("aria-readonly")).toBe(false);
  });
});
