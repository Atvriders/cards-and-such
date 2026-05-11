import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onwebkitanimationend` attribute.
 *
 * `onwebkitanimationend` is a legacy vendor-prefixed inline event
 * handler attribute that mirrors the standard `onanimationend`. It
 * was relevant only for very old WebKit-based browsers that fired
 * `webkitAnimationEnd` instead of the unprefixed `animationend`
 * event. On a modern `<div role="tablist">` it is meaningless:
 *  1. All evergreen browsers (Chrome, Firefox, Safari, Edge) dispatch
 *     the unprefixed `animationend` event — the prefixed
 *     `webkitAnimationEnd` is a legacy alias kept only for backward
 *     compatibility with ancient WebKit builds.
 *  2. Inline event-handler attributes (`on*=""`) execute their value
 *     as JavaScript in the global scope — a stray
 *     `onwebkitanimationend="..."` would be a CSP / XSS smell on a
 *     React component that already wires listeners via JSX props.
 *  3. The chip strip uses CSS transitions for scroll/snap behavior,
 *     not CSS animations — there is no `@keyframes` rule whose end
 *     event the tablist would care about.
 *
 * Why this needs its own pin: the existing LobbyChipStripNo* family
 * pins absence of dozens of global/legacy attributes (cite, coords,
 * accesskey, autofocus, etc.) and a handful of inline event handlers,
 * but none of them currently introspect `onwebkitanimationend`. A
 * regression that added `onwebkitanimationend="..."` would slip past
 * every existing pin.
 *
 * The pin asserts BOTH primitives:
 *  - `hasAttribute("onwebkitanimationend") === false`
 *  - `getAttribute("onwebkitanimationend") === null`
 * Together these reject any authoring of the attribute, including
 * `onwebkitanimationend=""` (empty value still authored).
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className keeps the pin scoped specifically
 * to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onwebkitanimationend attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onwebkitanimationend attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: we are looking at the chip-strip tablist track.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO onwebkitanimationend attribute is authored.
    expect(track!.hasAttribute("onwebkitanimationend")).toBe(false);
    expect(track!.getAttribute("onwebkitanimationend")).toBeNull();
  });
});
