import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2829 — the LobbyPage chip-strip track (`<div class="lobby-chips">` at
 * LobbyPage.tsx ~L2623-2630) is a `role="tablist"` container that holds
 * the category filter chips. It is NOT a text-entry surface: no `<input>`
 * / `<textarea>` / `contenteditable` lives directly on the track, and the
 * chips inside are `<button>` elements whose visible labels are static
 * (e.g. "All", "Arcade", "Board", "Card", ...). The chip glyphs are
 * decorative emoji handled by `aria-hidden` siblings.
 *
 * Because the strip carries no editable text, declaring `spellcheck` on
 * it would be meaningless — the browser has nothing to check. The current
 * markup correctly OMITS the attribute (it's not present in the JSX at
 * LobbyPage.tsx ~L2623-2628), inheriting the platform default rather than
 * pinning a value. A regression that added `spellCheck={false}` (or any
 * literal) would silently change the inherited spellcheck context for any
 * future descendants and add a redundant DOM attribute on a non-editable
 * surface.
 *
 * Sibling coverage on the same `.lobby-chips` track pins other inertness
 * properties (no `id` / `name` / `style` / `tabindex` / `value` / etc.
 * across LobbyChipAllNo*.test.tsx, LobbyChipArcadeNo*.test.tsx, ...),
 * but no existing test asserts the ABSENCE of the `spellcheck`
 * attribute on the strip container itself. This file fills that gap.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the other LobbyChip*No* tests: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — .lobby-chips chip-strip omits the spellcheck attribute (W2829)", () => {
  it("does not declare spellcheck on the chip-strip track container", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // The chip-strip track MUST exist — guards against a regression that
    // renamed or removed the `.lobby-chips` container.
    const strip = document.querySelector<HTMLElement>(".lobby-chips");
    expect(strip).not.toBeNull();

    // Pin the absence of the `spellcheck` attribute. The current JSX at
    // LobbyPage.tsx ~L2623-2628 does NOT pass `spellCheck`, so the DOM
    // node should not carry the attribute. A regression that added
    // `spellCheck={false}` would surface here as a `true` from
    // `hasAttribute("spellcheck")`.
    expect(strip!.hasAttribute("spellcheck")).toBe(false);
  });
});
