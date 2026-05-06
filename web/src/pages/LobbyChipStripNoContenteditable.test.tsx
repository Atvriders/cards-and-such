import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2838 — the LobbyPage chip-strip track (`<div class="lobby-chips">` at
 * LobbyPage.tsx ~L2623-2630) is a `role="tablist"` container that holds
 * the category filter chips. It is NOT a text-entry surface: no `<input>`
 * / `<textarea>` / `contenteditable` lives directly on the track, and the
 * chips inside are `<button>` elements whose visible labels are static
 * (e.g. "All", "Arcade", "Board", "Card", ...). The chip glyphs are
 * decorative emoji handled by `aria-hidden` siblings.
 *
 * Because the strip is not an editing host, declaring `contenteditable`
 * on it would be meaningless and harmful — it would turn the tablist
 * into a text-editing surface, capturing keystrokes intended for the
 * tab navigation, breaking the role contract, and exposing a focusable
 * caret target that screen readers would announce as "edit text". The
 * current markup correctly OMITS the attribute (it's not present in the
 * JSX at LobbyPage.tsx ~L2623-2628), inheriting the platform default of
 * non-editable. A regression that added `contentEditable={false}` (or
 * any literal) would still register the attribute and could subtly
 * change the inherited editability context for future descendants.
 *
 * Sibling coverage on the same `.lobby-chips` track pins other inertness
 * properties (no `id` / `name` / `style` / `tabindex` / `spellcheck` /
 * `dir` / `lang` / `translate` / `autofocus` / etc. across the
 * LobbyChipStripNo*.test.tsx family), but no existing test asserts the
 * ABSENCE of the `contenteditable` attribute on the strip container
 * itself. This file fills that gap.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the other LobbyChipStripNo* tests: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — .lobby-chips chip-strip omits the contenteditable attribute (W2838)", () => {
  it("does not declare contenteditable on the chip-strip track container", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // The chip-strip track MUST exist — guards against a regression that
    // renamed or removed the `.lobby-chips` container.
    const strip = document.querySelector<HTMLElement>(".lobby-chips");
    expect(strip).not.toBeNull();

    // Pin the absence of the `contenteditable` attribute. The current JSX
    // at LobbyPage.tsx ~L2623-2628 does NOT pass `contentEditable`, so the
    // DOM node should not carry the attribute. A regression that added
    // `contentEditable={false}` (or any literal) would surface here as a
    // `true` from `hasAttribute("contenteditable")`.
    expect(strip!.hasAttribute("contenteditable")).toBe(false);
  });
});
