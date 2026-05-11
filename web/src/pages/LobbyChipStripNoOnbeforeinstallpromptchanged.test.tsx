import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onbeforeinstallpromptchanged` attribute.
 *
 * `onbeforeinstallpromptchanged` is not a standard inline event handler
 * attribute. The standard PWA install-prompt event is
 * `beforeinstallprompt`, fired on `window` (not on arbitrary DOM
 * elements). Authoring `onbeforeinstallpromptchanged="..."` on a
 * `<div role="tablist">` would be wrong because:
 *  1. The chip strip is a filter rail of `role="tab"` buttons — it has
 *     no relationship to PWA installation lifecycle.
 *  2. Inline event-handler content attributes for non-standard events
 *     are inert in every spec-compliant user agent; they only serve to
 *     confuse static analyzers and CSP auditors.
 *  3. Any string value would be a regression that hints at misplaced
 *     install-prompt wiring inside the lobby filter strip.
 *
 * Anchor: `document.querySelector(".lobby-chips")` — scopes the pin
 * specifically to the chip filter strip rather than any sibling
 * tablist elsewhere in the tree.
 */
describe("LobbyPage — .lobby-chips tablist has no onbeforeinstallpromptchanged attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onbeforeinstallpromptchanged attribute", () => {
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

    // The pin: NO onbeforeinstallpromptchanged attribute is authored
    // on the chip strip.
    expect(track!.hasAttribute("onbeforeinstallpromptchanged")).toBe(false);
    expect(track!.getAttribute("onbeforeinstallpromptchanged")).toBeNull();
  });
});
