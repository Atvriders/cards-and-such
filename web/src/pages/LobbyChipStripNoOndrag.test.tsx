import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3183 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `ondrag` attribute.
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
 * `ondrag` is a legacy inline event-handler content attribute that
 * fires continuously while a draggable element is being dragged. On a
 * `<div role="tablist">` it is meaningless and harmful:
 *  1. The chip strip is NOT a draggable source — it has no `draggable`
 *     attribute and no drag-source behavior. Authoring `ondrag=""` on
 *     a non-draggable element installs a no-op handler that never
 *     fires but pollutes the DOM with dead event-handler markup.
 *  2. Inline event-handler attributes execute as JavaScript via the
 *     legacy `[[GetOwnProperty]]` HTML parser path, which the CSP
 *     `script-src` directive blocks under `'strict-dynamic'` and
 *     reports under `unsafe-inline` violations. A stray `ondrag="..."`
 *     would trip CSP report-uri telemetry on every render.
 *  3. React's synthetic-event system handles drag events via the
 *     `onDrag` prop (capitalized, JSX), which attaches a delegated
 *     listener at the root — NOT via the legacy `ondrag=""` content
 *     attribute. Authoring the lowercase HTML attribute would bypass
 *     React's event pooling and synthetic-event normalization.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy event-handler
 *    attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `ondrag`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `ondrag`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — orthogonal to `ondrag`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` (a
 *    legacy image-map attribute) — silent on `ondrag`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` (a legacy
 *    quote-source URL attribute) — silent on `ondrag`.
 *  - The broad family of LobbyChipStripNo* pins each pin one specific
 *    global/legacy attribute's absence — none of them currently cover
 *    the `ondrag` inline event-handler attribute. A regression that
 *    added `ondrag="handleDrag()"` (e.g. by mistakenly templating a
 *    legacy drag handler onto the tablist) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("ondrag") === false` AND
 * `track.getAttribute("ondrag") === null`. Both are asserted because
 * an `ondrag=""` regression would still set `hasAttribute` true while
 * `getAttribute` returns `""` — and a non-authored attribute returns
 * `null` from `getAttribute`. Pinning both forms catches the empty-
 * string regression as well as the populated-handler regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no ondrag attribute (W3183)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an ondrag attribute", () => {
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

    // The pin: NO ondrag attribute is authored on the chip strip.
    // A regression that adds `ondrag=""`, `ondrag="handleDrag()"`,
    // or any other inline drag event handler would fail here.
    expect(track!.hasAttribute("ondrag")).toBe(false);
    expect(track!.getAttribute("ondrag")).toBeNull();
  });
});
