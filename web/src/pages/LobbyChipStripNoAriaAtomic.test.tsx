import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2823 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered around LobbyPage.tsx
 * ~L2623-L2628) carries NO `aria-atomic` attribute.
 *
 * The element's authored attribute set is intentionally minimal:
 *
 *     <div
 *       ref={trackRef}
 *       className="lobby-chips"
 *       role="tablist"
 *       aria-label="Filter by category"
 *     >
 *
 * `aria-atomic` is a live-region modifier: when an ancestor (or the
 * element itself) is a live region (`aria-live="polite|assertive"`
 * or an implicit-live role like `status`/`alert`), `aria-atomic`
 * controls whether assistive tech announces the ENTIRE region on
 * mutation (`true`) or only the changed subtree (`false`). The
 * chip-strip tablist is NOT a live region — its role is `tablist`,
 * which has no implicit live semantics, and no `aria-live` is
 * authored on it (or any nearby ancestor in the chip rail subtree).
 *
 * Adding `aria-atomic` to a non-live element is at best a no-op for
 * compliant screen readers and at worst confusing noise that some
 * ARIA-validation tooling will flag as an authoring mistake (the
 * attribute only has defined meaning in the context of a live
 * region per WAI-ARIA 1.2 §6.6.2). Either polarity would be wrong
 * here: `aria-atomic="true"` would imply the strip is a live region
 * whose every mutation should be re-read in full, and
 * `aria-atomic="false"` would be redundant noise without an
 * accompanying live-region declaration.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its ARIA attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — it is silent on
 *    `aria-atomic`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `aria-atomic`.
 *  - W1997 (LobbyChipsWrapAttr) pins that the OUTER wrapper has no
 *    `role` attribute — completely orthogonal to the inner track's
 *    `aria-atomic` state.
 *  - W2754 (LobbyChipsNoAriaMultiselectable), W2767 (NoAriaBusy),
 *    and the rest of the LobbyChipStripNoAria* family each pin a
 *    DIFFERENT specific ARIA attribute's absence — none cover
 *    `aria-atomic`.
 *  - None of the existing pins would catch a regression that added
 *    `aria-atomic="true"` (or `="false"`) to the inner
 *    `<div class="lobby-chips" role="tablist">`.
 *
 * The pin: `track.hasAttribute("aria-atomic") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting *absence*, and matches the
 * accessor most ARIA-introspection tooling actually uses to decide
 * whether the live-region announcement default applies.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip and
 * does not depend on any other ARIA attribute of the element under
 * test.
 */
describe("LobbyPage — .lobby-chips tablist has no aria-atomic attribute (W2823)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an aria-atomic attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: we are looking at the chip-strip tablist track, not
    // some other element. The pin only carries weight if the element
    // is in fact the role="tablist" filter rail.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO aria-atomic attribute is authored on the chip strip.
    // A regression that adds `aria-atomic="true"` (semantically
    // claiming the rail is a live region whose every mutation should
    // be announced in full) or even `aria-atomic="false"` (noise
    // without an accompanying aria-live) would fail here.
    expect(track!.hasAttribute("aria-atomic")).toBe(false);
  });
});
