import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2845 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered around LobbyPage.tsx)
 * carries NO `autocapitalize` attribute.
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
 * `autocapitalize` is a global HTML content attribute that hints to the
 * UA how text input/contenteditable surfaces should auto-capitalize the
 * user's typing (values: `off | none | on | sentences | words |
 * characters`). Authoring it on the chip-strip tablist container would
 * be wrong for two reasons:
 *  1. The tablist `<div>` is not an editable surface — it is neither
 *     `<input>` / `<textarea>` nor `contenteditable`. The attribute
 *     therefore has no defined behavioral effect on this node and only
 *     adds noise to the rendered DOM.
 *  2. Even on browsers that propagate the hint to descendant editable
 *     fields, the chip strip contains only `role="tab"` buttons — no
 *     descendant text inputs. Any propagated hint would be either dead
 *     weight or, worse, an attractive nuisance for future refactors
 *     that insert an input under the strip and inherit a stale value.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its global text-input hint
 *    attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on
 *    `autocapitalize`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact `aria-label`
 *    string — also silent on `autocapitalize`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal.
 *  - W2804 (LobbyChipStripNoAutofocus) pins absence of `autofocus` —
 *    orthogonal boolean attribute, distinct surface.
 *  - The various `LobbyChipStripNoSpellcheck` /
 *    `LobbyChipStripNoInputmode` / `LobbyChipStripNoContenteditable`
 *    pins each cover a *different* text-input-adjacent global
 *    attribute. None of them touches `autocapitalize`, so a regression
 *    that added `autocapitalize="off"` (or any other value) to the
 *    chip-strip track would slip past every existing pin in the suite.
 *
 * The pin: `track.hasAttribute("autocapitalize") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting *absence* of an HTML attribute —
 * the empty string `autocapitalize=""` is also a regression and must
 * fail the assertion.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a sibling
 * drawer tablist elsewhere in the tree, so anchoring on the stable
 * `.lobby-chips` className (rather than `getByRole("tablist")`) keeps
 * the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no autocapitalize attribute (W2845)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an autocapitalize attribute", () => {
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

    // The pin: NO autocapitalize attribute is authored on the chip
    // strip. A regression that adds `autocapitalize`,
    // `autocapitalize=""`, `autocapitalize="off"`, `"none"`,
    // `"sentences"`, `"words"`, or `"characters"` would fail here.
    expect(track!.hasAttribute("autocapitalize")).toBe(false);
  });
});
