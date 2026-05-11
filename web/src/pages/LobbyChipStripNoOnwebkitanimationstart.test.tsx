import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Cap-10 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onwebkitanimationstart` attribute.
 *
 * `onwebkitanimationstart` is a vendor-prefixed legacy event-handler
 * IDL attribute that mirrored the standard `onanimationstart` for
 * older WebKit/Blink builds. Authoring it inline on the chip strip
 * would be wrong because:
 *  1. The chip-strip filter rail does not run a CSS animation that
 *     fires `animationstart` — it is a flex/scroll container of
 *     `role="tab"` buttons. There is no animation lifecycle to hook.
 *  2. Inline event-handler attributes (`on*="..."`) are a CSP /
 *     XSS surface — pinning their absence keeps the surface closed.
 *  3. The `webkit`-prefixed form is redundant with the standard
 *     `onanimationstart` in every browser the app targets; carrying
 *     both would be a vendor-prefix smell.
 *
 * The pin: `track.hasAttribute("onwebkitanimationstart") === false`
 * AND `track.getAttribute("onwebkitanimationstart") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. The sibling
 * drawer tablist is anchored elsewhere, so the `.lobby-chips`
 * className keeps the pin scoped to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onwebkitanimationstart attribute (Cap-10)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onwebkitanimationstart attribute", () => {
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

    // The pin: NO onwebkitanimationstart attribute is authored on
    // the chip strip. A regression that adds
    // `onwebkitanimationstart="..."` would fail here.
    expect(track!.hasAttribute("onwebkitanimationstart")).toBe(false);
    expect(track!.getAttribute("onwebkitanimationstart")).toBeNull();
  });
});
