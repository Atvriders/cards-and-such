import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2850 — the chip-strip tablist track (`.lobby-chips`) MUST NOT carry
 * a `slot` attribute. The track is the inner `<div role="tablist">`
 * rendered inside the chip-strip wrapper on LobbyPage.
 *
 * Sibling pins on the same `.lobby-chips` track already cover other
 * attribute-shape contracts (see LobbyChipStripNoLang.test.tsx,
 * LobbyChipStripNoForm.test.tsx, LobbyChipStripNoTabindex.test.tsx,
 * LobbyChipStripNoId.test.tsx, etc. for the catalog: tag, aria, id,
 * style, child count, form, lang, etc.). What none of those cover is
 * the ABSENCE of a `slot` attribute on the chip-strip track itself.
 *
 * The `slot` attribute is the Shadow DOM hook that assigns a light-DOM
 * element to a named `<slot>` inside an enclosing custom element. The
 * lobby chip-strip is a plain React-rendered `<div role="tablist">`
 * living in the regular document tree — there is no enclosing custom
 * element, no shadow root, and no named-slot contract for it to
 * participate in. A stray `slot="..."` on the strip would:
 *   1. Be silently inert in the current tree (no shadow host above
 *      it), creating misleading dead markup that suggests a Web
 *      Components integration that does not exist.
 *   2. Become load-bearing the moment the lobby is ever embedded
 *      inside a custom element shell, where the strip would be
 *      reparented into a slot the author never intended, breaking
 *      layout in a hard-to-trace way.
 *   3. Confuse tooling and a11y trees that treat `slot` as a
 *      structural Shadow-DOM signal.
 *
 * One focused assertion: the `.lobby-chips` tablist track MUST NOT
 * carry a `slot` attribute at all. If a future change deliberately
 * adopts Shadow DOM here, it should add the attribute AND update this
 * pin in the same commit so the trade-off is explicit.
 *
 * Lives in a NEW SIBLING file following the established
 * LobbyChipStripNoLang / LobbyChipStripNoForm pattern so the test
 * shares the `src/pages/Lobby` vitest path filter without colliding
 * with concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-strip track has no slot attribute (W2850)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .lobby-chips tablist track does NOT carry a slot attribute", () => {
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

    // The actual contract: no `slot` attribute on the chip-strip
    // track. Use `hasAttribute` so even an empty `slot=""` would
    // be flagged.
    expect(strip!.hasAttribute("slot")).toBe(false);
  });
});
