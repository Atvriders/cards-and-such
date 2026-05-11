import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onmozanimationend` attribute.
 *
 * `onmozanimationend` is a legacy Mozilla-prefixed event handler
 * attribute (a non-standard precursor to the standardized
 * `onanimationend`) that fires when a CSS animation completes on the
 * element. It has no business being inline-authored on the chip strip:
 *  1. It is a vendor-prefixed, non-standard attribute. Modern Firefox
 *     handles the unprefixed `animationend` event, and no other engine
 *     understands the `-moz-` form.
 *  2. Inline event handler attributes embed executable JavaScript
 *     directly in the DOM and bypass any `script-src` policy that
 *     forbids inline handlers.
 *  3. The chip strip uses React listeners (onAnimationEnd via JSX) when
 *     animation hooks are needed; a raw HTML `onmozanimationend=""`
 *     would be a regression from a stray template leak.
 *
 * The pin: `track.hasAttribute("onmozanimationend") === false` and
 * `track.getAttribute("onmozanimationend") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. Scoped to the
 * stable className so a sibling drawer tablist elsewhere in the tree
 * cannot satisfy this query.
 */
describe("LobbyPage — .lobby-chips tablist has no onmozanimationend attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onmozanimationend attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: confirm we are looking at the chip-strip tablist track.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO onmozanimationend attribute is authored on the chip
    // strip. Any value (empty string, JS expression, etc.) is a
    // regression.
    expect(track!.hasAttribute("onmozanimationend")).toBe(false);
    expect(track!.getAttribute("onmozanimationend")).toBeNull();
  });
});
