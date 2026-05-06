import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2875 — the LobbyPage chip-strip track (`<div class="lobby-chips">` at
 * LobbyPage.tsx ~L2623-2630) is a `role="tablist"` container holding the
 * category filter chip buttons. It is NOT an editing host: no `<input>`,
 * `<textarea>`, or `contenteditable` surface lives on the track itself.
 *
 * `virtualkeyboardpolicy` is a global HTML attribute that controls whether
 * the on-screen virtual keyboard automatically pops up when an editing
 * host gains focus (`auto` is default; `manual` lets the page call
 * `navigator.virtualKeyboard.show()` itself). Per the HTML spec it is
 * meaningful ONLY on elements whose `contenteditable` is `true`/`""` or
 * which are themselves form-control editing hosts. Declaring it on a
 * non-editable `<div>` is meaningless to the platform and to AT.
 *
 * The current markup correctly OMITS the attribute (it is not present in
 * the JSX at LobbyPage.tsx ~L2623-2628), so the DOM node carries no
 * virtual-keyboard policy hint at all. A regression that added e.g.
 * `virtualkeyboardpolicy="manual"` (perhaps copy-pasted from a search-
 * input pattern intending to suppress the on-screen keyboard) would
 * silently:
 *   1. Add a redundant DOM attribute on a surface that cannot receive
 *      text input, polluting any future automated audit that flags
 *      virtualkeyboardpolicy on non-editing-host nodes.
 *   2. Risk being mistaken by future contributors for an intentional
 *      contract on the chip-strip — encouraging cargo-culted copies onto
 *      sibling non-editable surfaces.
 *   3. Defeat the existing inertness story sibling pins establish for the
 *      strip (see LobbyChipStripNoInputmode / LobbyChipStripNoSpellcheck
 *      / LobbyChipStripNoAutofocus / LobbyChipStripNoTabindex / etc.).
 *
 * Sibling coverage on the same `.lobby-chips` track pins many other
 * absent attributes (no `id`, `name`, `style`, `tabindex`, `value`,
 * `spellcheck`, `autofocus`, `inputmode`, `dir`, `lang`, ... across the
 * LobbyChipStripNo*.test.tsx family), but no existing test asserts the
 * ABSENCE of `virtualkeyboardpolicy` on the strip container itself. This
 * file fills that gap.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the other LobbyChipStripNo* tests: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — .lobby-chips chip-strip omits the virtualkeyboardpolicy attribute (W2875)", () => {
  it("does not declare virtualkeyboardpolicy on the chip-strip track container", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // The chip-strip track MUST exist — guards against a regression that
    // renamed or removed the `.lobby-chips` container, which would make
    // the virtualkeyboardpolicy assertion below pass vacuously on a null
    // lookup.
    const strip = document.querySelector<HTMLElement>(".lobby-chips");
    expect(strip).not.toBeNull();

    // Pin the absence of the `virtualkeyboardpolicy` attribute. The
    // current JSX at LobbyPage.tsx ~L2623-2628 does NOT pass
    // `virtualKeyboardPolicy`, so the DOM node should not carry the
    // attribute. A regression that added `virtualkeyboardpolicy="manual"`
    // (or any literal) would surface here as a `true` from
    // `hasAttribute("virtualkeyboardpolicy")`.
    expect(strip!.hasAttribute("virtualkeyboardpolicy")).toBe(false);
  });
});
