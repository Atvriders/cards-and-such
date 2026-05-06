import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2909 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered by LobbyPage.tsx) carries
 * NO `disabled` attribute.
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
 * The `disabled` attribute is not a valid global HTML attribute — it is
 * only meaningful on form-associated elements (button, input, select,
 * textarea, fieldset, optgroup, option). On a non-form `<div>` host
 * like the chip-strip tablist, authoring `disabled` would be a silent
 * smell: the browser would round-trip it as a string attribute but no
 * native disablement semantics would apply, and assistive tech may
 * mis-report state. The proper inert/disabled signal for a tablist host
 * is `aria-disabled` (or per-tab `aria-disabled`), not the boolean
 * form-control `disabled` attribute.
 *
 * Why this needs its own pin separate from the existing `.lobby-chips`
 * / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — it is silent on
 *    presentation/state attributes like `disabled`.
 *  - The numerous `LobbyChipStripNo*` sibling pins each pin one
 *    specific attribute absence (accesskey, action, anchor, autofocus,
 *    contenteditable, dir, form, hidden, id, inputmode, lang, name,
 *    spellcheck, style, tabindex, translate, value, etc.) — none of
 *    them assert `disabled` absence.
 *  - The various `aria-*` absence pins (aria-busy, aria-checked,
 *    aria-disabled, aria-expanded, aria-pressed, aria-readonly,
 *    aria-selected, etc.) cover the ARIA state attributes — they are
 *    orthogonal to the boolean HTML form-control `disabled` attribute,
 *    which is a wholly different attribute name.
 *  - None of the existing pins would catch a regression that added
 *    `disabled` (or `disabled=""`) to the inner
 *    `<div class="lobby-chips" role="tablist">`.
 *
 * The pin: `track.hasAttribute("disabled") === false`.
 * `hasAttribute` (rather than checking any IDL property) is the
 * canonical primitive for asserting absence of the AUTHORED attribute,
 * which is the exact state we want to pin.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a sibling
 * drawer tablist elsewhere in the tree, so anchoring on the stable
 * `.lobby-chips` className (rather than `getByRole("tablist")`) keeps
 * the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no disabled attribute (W2909)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a disabled attribute", () => {
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

    // The pin: NO disabled attribute is authored on the chip strip.
    // A regression that adds `disabled` (boolean) or `disabled=""` —
    // an invalid attribute on a non-form <div> host that would smell
    // of confused state semantics — would fail here.
    expect(track!.hasAttribute("disabled")).toBe(false);
  });
});
