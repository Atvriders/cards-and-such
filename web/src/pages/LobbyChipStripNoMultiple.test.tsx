import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2911 — the chip-strip tablist track (`.lobby-chips`) MUST NOT carry
 * a `multiple` attribute. The track is the inner `<div role="tablist">`
 * rendered inside the chip-strip wrapper on LobbyPage.
 *
 * Sibling pins on the same `.lobby-chips` track already cover other
 * attribute-shape contracts (see LobbyChipStripNoSlot.test.tsx,
 * LobbyChipStripNoLang.test.tsx, LobbyChipStripNoForm.test.tsx, etc.
 * for the broader catalog). What none of those cover is the ABSENCE
 * of a `multiple` attribute on the chip-strip track itself.
 *
 * The `multiple` attribute is a boolean attribute defined for native
 * form controls (`<select>`, `<input type="file">`, `<input type="email">`)
 * to permit multi-value selection. The lobby chip-strip is a plain
 * React-rendered `<div role="tablist">` — it is neither a `<select>`
 * nor an `<input>`, and the WAI-ARIA tablist pattern uses
 * `aria-multiselectable` (already pinned absent in
 * LobbyChipsNoAriaMultiselectable.test.tsx), not `multiple`, to
 * communicate multi-selection semantics. A stray `multiple="..."` on
 * the strip would:
 *   1. Be silently inert on a `<div>` (browsers ignore unknown boolean
 *      attributes on non-form elements), creating misleading dead
 *      markup that suggests multi-select behavior the strip does not
 *      implement.
 *   2. Confuse a11y tooling and serializers that key off the literal
 *      attribute name when generating control summaries.
 *   3. Become load-bearing if the strip ever gained a polyfill or
 *      custom-element shim that reads HTML attributes directly,
 *      surprising future maintainers.
 *
 * One focused assertion: the `.lobby-chips` tablist track MUST NOT
 * carry a `multiple` attribute at all. If multi-select semantics are
 * ever added, the correct expression is `aria-multiselectable="true"`
 * on the tablist, not the form-control `multiple` attribute, and this
 * pin should remain green either way.
 *
 * Lives in a NEW SIBLING file following the established
 * LobbyChipStripNoSlot / LobbyChipStripNoLang pattern so the test
 * shares the `src/pages/Lobby` vitest path filter without colliding
 * with concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-strip track has no multiple attribute (W2911)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .lobby-chips tablist track does NOT carry a multiple attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable className. querySelector (rather than
    // getByRole) avoids ambiguity with the sibling drawer tablist that
    // shares role="tablist", and the className itself is independent of
    // the attribute under test.
    const strip = document.querySelector<HTMLElement>(".lobby-chips");
    expect(strip).not.toBeNull();

    // Sanity: confirm we pinned the inner track and not the outer
    // `.lobby-chips-wrap` or a `.lobby-chips-arrow` overflow button.
    // Without this guard a future restructure that moved the className
    // onto a wrapper could pass this assertion vacuously.
    expect(strip!.tagName).toBe("DIV");
    expect(strip!.getAttribute("role")).toBe("tablist");

    // The actual contract: no `multiple` attribute on the chip-strip
    // track. Use `hasAttribute` so even an empty `multiple=""` would
    // be flagged.
    expect(strip!.hasAttribute("multiple")).toBe(false);
  });
});
