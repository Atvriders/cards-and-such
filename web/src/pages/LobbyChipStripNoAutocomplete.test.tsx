import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2847 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered around LobbyPage.tsx)
 * carries NO `autocomplete` attribute.
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
 * `autocomplete` is an HTML form-association content attribute meant
 * for editable form controls (`<input>`, `<textarea>`, `<select>`,
 * and form-associated custom elements). Authoring it on the
 * chip-strip tablist container would be wrong for two reasons:
 *  1. The tablist `<div>` is not a form control, so `autocomplete`
 *     has no defined semantics on it. The browser would either ignore
 *     it (best case) or treat it as an unknown global attribute
 *     (noise in the DOM, accessibility-tree confusion).
 *  2. The chip strip is a roving-tabindex tablist used for filtering
 *     the lobby. None of its category chip buttons accept user text
 *     entry, and the strip itself has no value to autofill — the
 *     attribute is not just unhelpful, it is semantically meaningless
 *     in this context.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its content attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `autocomplete`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `autocomplete`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `autocomplete`.
 *  - W2804 (LobbyChipStripNoAutofocus) pins absence of `autofocus`
 *    — orthogonal to `autocomplete` (autofocus is a focus-hijack
 *    boolean; autocomplete is a form-fill hint string).
 *  - The various per-chip / search-input `NoAutocomplete` pins
 *    (LobbySearchInputNoAutocomplete, etc.) assert absence on
 *    *other* elements (the search `<input>` in particular) — none of
 *    them would catch a regression that added `autocomplete` to the
 *    `.lobby-chips` strip container itself.
 *
 * The pin: `track.hasAttribute("autocomplete") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting *absence* of an HTML content
 * attribute — any authored value (including the empty string or
 * `"off"`) is a regression because it would imply a form-control
 * relationship that does not exist.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no autocomplete attribute (W2847)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an autocomplete attribute", () => {
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

    // The pin: NO autocomplete attribute is authored on the chip
    // strip. A regression that adds `autocomplete`, `autocomplete=""`,
    // `autocomplete="off"`, or `autocomplete="on"` would fail here.
    expect(track!.hasAttribute("autocomplete")).toBe(false);
  });
});
