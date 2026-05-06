import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2837 — the LobbyPage chip-strip track (`<div class="lobby-chips">` at
 * LobbyPage.tsx ~L2623-2630) is a `role="tablist"` container that holds
 * the category filter chips. It is an INTERACTIVE surface: users click
 * the chips ("All", "Arcade", "Board", "Card", ...) to filter the lobby
 * tile list, and the chips themselves carry keyboard focus.
 *
 * The HTML `inert` attribute, when set on an element, removes the entire
 * subtree from the accessibility tree, blocks pointer events, and makes
 * descendants unfocusable. Declaring `inert` on the chip-strip would
 * therefore silently disable the entire category filter — clicks would
 * be swallowed, screen readers would skip the tablist, and keyboard
 * navigation into the chips would be impossible. The current markup
 * correctly OMITS the attribute (it's not present in the JSX at
 * LobbyPage.tsx ~L2623-2628), keeping the strip live and operable.
 *
 * Sibling coverage on the same `.lobby-chips` track pins the absence of
 * other inertness / state attributes (no `spellcheck` / `inputmode` /
 * `aria-modal` / `aria-disabled` / `tabindex` / `id` / `name` / `style`
 * / `value` / `form` / `dir` / `lang` / `translate` / `autofocus` /
 * `aria-controls` / `aria-current` / `aria-described-by` / `aria-busy`
 * / `aria-atomic` / `aria-checked` / `aria-expanded` / `aria-haspopup`
 * / `aria-keyshortcuts` / `aria-live` / `aria-orientation` /
 * `aria-pressed` / `aria-readonly` / `aria-relevant` / `aria-required`
 * / `aria-role-description` / `aria-selected` across LobbyChipStripNo*
 * .test.tsx), but no existing test asserts the ABSENCE of the `inert`
 * attribute on the strip container itself. This file fills that gap —
 * a regression that added `inert` (e.g. while wiring a modal overlay
 * that should have applied `inert` to a different ancestor) would
 * silently break the entire category filter, and that failure mode is
 * worth pinning explicitly.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the other LobbyChip*No* tests: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — .lobby-chips chip-strip omits the inert attribute (W2837)", () => {
  it("does not declare inert on the chip-strip track container", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // The chip-strip track MUST exist — guards against a regression that
    // renamed or removed the `.lobby-chips` container.
    const strip = document.querySelector<HTMLElement>(".lobby-chips");
    expect(strip).not.toBeNull();

    // Pin the absence of the `inert` attribute. The current JSX at
    // LobbyPage.tsx ~L2623-2628 does NOT pass `inert`, so the DOM
    // node should not carry the attribute. A regression that added
    // `inert` (or `inert={true}`) would surface here as a `true` from
    // `hasAttribute("inert")` and would silently disable the whole
    // category filter strip.
    expect(strip!.hasAttribute("inert")).toBe(false);
  });
});
