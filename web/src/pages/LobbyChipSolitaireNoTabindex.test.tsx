import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2720 — the LobbyPage `chip-solitaire` Chip <button> MUST NOT carry a
 * `tabindex` attribute. The Chip helper (LobbyPage.tsx ~L2651) renders a
 * plain `<button>` with no `tabIndex` prop forwarded onto the per-category
 * chip wrapper, leaving the button's tab participation to the browser's
 * default — every native <button> is in the sequential focus order with
 * tabindex=0 implicitly, and any explicit `tabindex` attribute would be a
 * bug, NOT a no-op.
 *
 * Sibling pins on `chip-solitaire` already in the suite cover OTHER
 * attribute absences but NOT the `tabindex`-attribute absence:
 *   - LobbyChipSolitaireNoStyle pins the `style`-attribute absence.
 *   - LobbyChipSolitaireNoId pins the `id`-attribute absence.
 *   - LobbyChipSolitaireNoForm / NoName / NoValue pin form-plumbing absences.
 *   - LobbyChipSolitaireNoAutofocus pins the `autofocus`-attribute absence.
 *   - LobbyChipSolitaireNoAriaControls / NoAriaDisabled / NoAriaLabel pin
 *     ARIA-attribute absences.
 *   - LobbyChipSolitaireType pins `type="button"`.
 *   - LobbyChipSolitaireAriaSelectedDefault pins the default ARIA state.
 *   - LobbyChipSolitaireRole pins the implicit button role surface.
 *   - LobbyChipSolitaireGlyphAria pins the glyph aria contract.
 *
 * Why the absence of `tabindex` matters here:
 *   1. A plain <button> is already in the natural tab order — adding
 *      `tabindex="0"` is redundant and signals that the author thought
 *      the element WASN'T natively focusable, which is a code smell that
 *      tends to drag a `role="button"` along with it on a future refactor.
 *   2. A positive `tabindex` (e.g. `tabindex="1"`) on a chip would yank
 *      it ahead of every other element on the page in the focus order,
 *      breaking the lobby's expected top-to-bottom keyboard traversal
 *      and producing a WCAG 2.4.3 (Focus Order) failure.
 *   3. A `tabindex="-1"` on the chip would silently remove it from the
 *      tab order entirely — keyboard users could never reach Solitaire
 *      without a mouse, while sighted-mouse users would see no change,
 *      making the regression invisible to non-keyboard reviewers.
 *   4. The chip strip is rendered as a horizontal list of category
 *      buttons; any of these `tabindex` regressions would desynchronize
 *      Solitaire from its siblings and from the browser's default
 *      arrow-key/tab semantics that automated a11y tooling expects.
 *
 * Resolves the chip via its stable `data-testid="chip-solitaire"` (rendered
 * through `testId={`chip-${cat}`}` at LobbyPage.tsx ~L1970) so the
 * assertion is locale-independent and immune to translation-key changes.
 */
describe("LobbyPage — chip-solitaire button has no tabindex attribute (W2720)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-solitaire <button> does NOT carry a tabindex attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-solitaire");

    // Sanity: confirm we pinned the actual chip-solitaire <button> wrapper
    // and not a descendant span. A future restructure that moved the
    // testid down onto an inner glyph span could otherwise pass this
    // assertion vacuously (spans aren't tabbable by default regardless).
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `tabindex` attribute on chip-solitaire. Use
    // `hasAttribute` rather than inspecting the `tabIndex` IDL property
    // — every focusable element has a numeric `tabIndex` property whose
    // default for <button> is 0, so `chip.tabIndex === 0` would PASS even
    // when an author had explicitly written `tabIndex={0}` in JSX. The
    // serialized DOM attribute is the only signal that distinguishes the
    // implicit default from a redundant explicit override.
    expect(chip.hasAttribute("tabindex")).toBe(false);
  });
});
