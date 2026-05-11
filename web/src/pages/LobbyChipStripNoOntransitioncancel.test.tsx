import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `ontransitioncancel` attribute.
 *
 * `ontransitioncancel` is the inline event-handler attribute for the
 * CSS `transitioncancel` event, fired when a CSS transition is
 * interrupted before completion. Authoring it inline on the chip
 * strip would be wrong because:
 *  1. Inline event-handler attributes (`on*=`) embed string-form
 *     JavaScript and are flagged by CSP `script-src 'unsafe-inline'`
 *     audits; the project's event wiring is exclusively React
 *     synthetic handlers attached via JSX props.
 *  2. The chip strip filter rail does not host any transition
 *     observation logic — there is no `transitioncancel` listener
 *     wired anywhere in LobbyPage, so the attribute would be dead
 *     code at best and a stray side-channel at worst.
 *  3. Validators (W3C Nu, html-validate) and security linters flag
 *     inline event handlers as anti-patterns; a stray
 *     `ontransitioncancel="..."` on a `<div role="tablist">` would
 *     pollute both accessibility and security CI reports.
 *
 * The pin: `track.hasAttribute("ontransitioncancel") === false` and
 * `track.getAttribute("ontransitioncancel") === null`. Together they
 * catch both authored-empty (`ontransitioncancel=""`) and authored-
 * with-value regressions.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no ontransitioncancel attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an ontransitioncancel attribute", () => {
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

    // The pin: NO ontransitioncancel attribute is authored on the
    // chip strip. Both `hasAttribute` and `getAttribute` are asserted
    // to catch both authored-empty and authored-with-value regressions.
    expect(track!.hasAttribute("ontransitioncancel")).toBe(false);
    expect(track!.getAttribute("ontransitioncancel")).toBeNull();
  });
});
