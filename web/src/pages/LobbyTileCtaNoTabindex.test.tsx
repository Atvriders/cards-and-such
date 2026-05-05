import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2287 — the per-tile footer "Play" CTA span (`.tile-cta`) MUST NOT
 * carry a `tabindex` attribute. The CTA is the decorative span rendered
 * inside each lobby tile's footer (LobbyPage.tsx ~L2073, ~L3052, ~L3291,
 * ~L3415, ~L3479) holding the literal "Play"/"Pick" text plus an arrow
 * SVG:
 *
 *     <div className="tile-foot">
 *       <span className="tile-players">…</span>
 *       <span className="tile-cta" aria-hidden="true">Play</span>
 *     </div>
 *
 * Sibling pins already cover the CTA's other contract bits:
 *   - LobbyTilePlayCtaHidden.test.tsx (W1344) pins the SoloCard CTA's
 *     `aria-hidden="true"` attribute.
 *   - LobbyFamilyCta.test.tsx (W1314) pins the family-tile CTA's text
 *     content ("Pick" not "Play").
 *   - LobbyTileFootNoTabindex.test.tsx (W2253) pins the absence of
 *     `tabindex` on the WRAPPER `.tile-foot` div — NOT the inner
 *     `.tile-cta` span this pin guards.
 *
 * What none of those cover is the ABSENCE of a `tabindex` attribute on
 * the inner `.tile-cta` span itself. Because the CTA is wrapped in a
 * `<Link>` that already encodes the accessible name and is itself the
 * keyboard tab stop for the tile, adding `tabindex` to the inner
 * `.tile-cta` `<span>` would silently:
 *   1. Insert a redundant focusable element inside an already-focusable
 *      Link, doubling the keyboard tab stops per tile in the lobby grid.
 *   2. Make an `aria-hidden="true"` element keyboard-reachable, which is
 *      an explicit WCAG 4.1.2 violation: focusable elements MUST be
 *      exposed to AT, but `aria-hidden` removes them from the
 *      accessibility tree — a contradiction that screen readers and
 *      automated audits flag as a hard error.
 *   3. Couple sibling tooling (focus-trap helpers, roving-tabindex
 *      scripts, axe rules) to an attribute this codebase has
 *      deliberately not advertised on the decorative CTA span.
 *
 * One focused assertion: the first rendered `.tile-cta` span MUST NOT
 * carry a `tabindex` attribute. If a future change converts the CTA
 * into an independently-focusable affordance (unlikely — the wrapping
 * Link already serves that role), it should add the new `tabindex`
 * AND drop the `aria-hidden`, AND update this pin in the same commit,
 * making the AT trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W2253 LobbyTileFootNoTabindex / W1344 LobbyTilePlayCta
 * pattern so the test shares the `src/pages/Lobby` vitest path filter
 * without colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-cta span has no tabindex attribute (W2287)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("a .tile-cta span does NOT carry a tabindex attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable className. querySelector returns the first
    // match, which is sufficient for this single-attribute pin and
    // avoids coupling to the (separately-pinned) total tile count.
    const cta = document.querySelector<HTMLElement>(".tile-cta");
    expect(cta).not.toBeNull();

    // Sanity: confirm we pinned the CTA span itself and not, say, a
    // wrapping div. Without this guard a future restructure that moved
    // the className onto a different element could pass vacuously.
    expect(cta!.tagName).toBe("SPAN");

    // The actual contract: no `tabindex` attribute on the tile-cta
    // span. Use `hasAttribute` rather than reading the property — the
    // DOM `tabIndex` IDL attribute reflects a default of -1 for
    // non-focusable elements even when no markup attribute is present,
    // so only `hasAttribute` distinguishes "absent" from "explicitly 0".
    expect(cta!.hasAttribute("tabindex")).toBe(false);
  });
});
