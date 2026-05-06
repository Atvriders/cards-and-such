import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2813 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `aria-roledescription` attribute.
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
 * `aria-roledescription` lets an author override the role string
 * that assistive tech announces (e.g. "tablist" -> "category
 * filter"). Authoring it on the chip rail would replace the
 * standard "tab list" announcement with custom prose for every
 * AT user, which is intentionally NOT done here — the rail is a
 * vanilla WAI-ARIA tablist and should be announced as such, with
 * the descriptive context coming from the existing
 * `aria-label="Filter by category"` instead. WAI-ARIA explicitly
 * cautions against using `aria-roledescription` on landmark or
 * widget roles unless localisation/branding strictly requires it,
 * because it suppresses the role's natural-language form.
 *
 * Why this needs its own pin separate from existing chip-strip
 * pins:
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on
 *    `aria-roledescription`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `aria-roledescription`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable), W2767
 *    (LobbyChipStripNoAriaBusy) and the rest of the
 *    LobbyChipStripNoAria* siblings each pin a single distinct
 *    ARIA-state attribute's absence; none of them touches
 *    `aria-roledescription`, which is a presentation/announcement
 *    override rather than a state attribute.
 *  - A regression that added `aria-roledescription="category
 *    filter"` (or any other string) to the inner
 *    `<div class="lobby-chips" role="tablist">` would silently
 *    change every assistive-tech announcement of the rail with no
 *    other test failing.
 *
 * The pin: `track.hasAttribute("aria-roledescription") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting *absence* and matches what
 * AT-introspection tooling uses to decide whether to fall back to
 * the role's intrinsic name.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on
 * the stable `.lobby-chips` className (rather than
 * `getByRole("tablist")`) keeps the pin scoped specifically to the
 * chip filter strip and does not depend on any other ARIA
 * attribute of the element under test.
 */
describe("LobbyPage — .lobby-chips tablist has no aria-roledescription attribute (W2813)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an aria-roledescription attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: confirm we're looking at the chip-strip tablist track.
    // The pin only carries weight if the element is in fact the
    // role="tablist" filter rail.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO aria-roledescription attribute is authored on the
    // chip strip. A regression that overrode the announced role
    // string (e.g. aria-roledescription="category filter") would
    // fail here.
    expect(track!.hasAttribute("aria-roledescription")).toBe(false);
  });
});
