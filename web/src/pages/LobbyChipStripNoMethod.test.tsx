import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2893 — the chip-strip tablist track (`.lobby-chips`) MUST NOT carry
 * a `method` attribute. The track is the inner `<div role="tablist">`
 * rendered around line 2625 of LobbyPage.tsx.
 *
 * Sibling pins on the same `.lobby-chips` track already cover other
 * attribute-shape contracts (see LobbyChipStripNoTabindex.test.tsx
 * header for the catalog: tag, aria, id, style, child count, etc.).
 * What none of those cover is the ABSENCE of a `method` attribute on
 * the chip-strip track itself.
 *
 * The `method` attribute is HTML's form-submission verb selector — it
 * is only meaningful on `<form>` elements where it picks GET vs POST
 * (or `dialog` for in-dialog forms). The chip-strip is a
 * `<div role="tablist">`, not a form, and it is not submitted. A
 * stray `method="..."` attribute would be:
 *   1. Semantically meaningless on a div, but inherited by tooling
 *      and copy-paste refactors that sweep up "all attributes".
 *   2. A misleading signal to readers that the element participates
 *      in form submission, which it does not.
 *   3. A foothold for a future refactor that mistakenly wrapped the
 *      chip-strip in form-submission logic.
 *
 * One focused assertion: the `.lobby-chips` tablist track MUST NOT
 * carry a `method` attribute at all. If a future change deliberately
 * needs one (extremely unlikely), it should add it AND update this
 * pin in the same commit, making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file following the established
 * LobbyChipStripNoForm / LobbyChipStripNoTabindex pattern so the
 * test shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-strip track has no method attribute (W2893)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .lobby-chips tablist track does NOT carry a method attribute", () => {
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

    // The actual contract: no `method` attribute on the chip-strip
    // track. Use `hasAttribute` so even an empty `method=""` would
    // be flagged.
    expect(strip!.hasAttribute("method")).toBe(false);
  });
});
