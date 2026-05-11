import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3186 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `ondragstart` attribute.
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
 * `ondragstart` is a legacy inline event-handler content attribute
 * that fires when the user begins dragging the element (after
 * `draggable="true"` is set). On a `<div role="tablist">` filter
 * rail it is meaningless and dangerous because:
 *  1. The chip strip is a horizontal scroll container of
 *     `role="tab"` buttons — it is not a draggable affordance.
 *     There is no drag-and-drop interaction model on the filter
 *     rail (no `draggable="true"`, no drop targets), so an
 *     `ondragstart` handler would never have a legitimate trigger
 *     surface.
 *  2. Inline event-handler attributes (`on*=""`) are a CSP /
 *     XSS-hardening anti-pattern — they execute string-evaluated
 *     JavaScript in the global scope and bypass any
 *     `script-src 'self'` or `unsafe-inline` restrictions that the
 *     deployment relies on for defense-in-depth.
 *  3. Even if the handler body were harmless, authoring an
 *     `ondragstart` would advertise the chip strip as
 *     drag-source-capable to assistive tech and devtools, polluting
 *     the semantic contract that the rail is a `tablist` of
 *     filter chips.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — silent on inner inline handlers.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `ondragstart`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote-source URL).
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot).
 *  - The broad family of LobbyChipStripNo* pins each cover one
 *    specific global/legacy/event-handler attribute's absence —
 *    none of them currently cover `ondragstart`. A regression that
 *    added `ondragstart="doSomething()"` (e.g. by mistakenly
 *    enabling drag-and-drop affordances on the filter rail) would
 *    slip past every existing pin.
 *
 * The pin: `track.hasAttribute("ondragstart") === false` AND
 * `track.getAttribute("ondragstart") === null`. Both primitives are
 * asserted because `hasAttribute` is the canonical absence check
 * (catches `ondragstart=""` with empty value) while
 * `getAttribute(...) === null` doubles as the value-level guard.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no ondragstart attribute (W3186)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an ondragstart attribute", () => {
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

    // The pin: NO ondragstart inline event-handler attribute is
    // authored on the chip strip. A regression that adds
    // `ondragstart=""`, `ondragstart="handleDrag(event)"`, or any
    // other inline handler binding would fail here.
    expect(track!.hasAttribute("ondragstart")).toBe(false);
    expect(track!.getAttribute("ondragstart")).toBeNull();
  });
});
