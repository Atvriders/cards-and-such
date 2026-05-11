import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onmouseleave` attribute.
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
 * `onmouseleave` is a legacy inline event-handler HTML attribute. In a
 * modern React codebase, pointer/mouse listeners are attached via the
 * synthetic-event system (`onMouseLeave={...}` JSX prop, which React
 * binds at the root and does NOT serialize onto the DOM as an
 * `onmouseleave="..."` attribute). Authoring a literal
 * `onmouseleave="..."` attribute on the chip strip would be wrong
 * because:
 *  1. It would represent an inline-handler string evaluated by the
 *     user agent, bypassing React's synthetic event system and any
 *     CSP `script-src` policy that disallows inline handlers.
 *  2. It would not participate in React's reconciliation — it would
 *     persist across rerenders as a stale string rather than a live
 *     listener.
 *  3. Validators and CSP reporters flag inline `on*` handler
 *     attributes as policy violations on strict CSP deployments.
 *
 * The pin: `track.hasAttribute("onmouseleave") === false` and
 * `track.getAttribute("onmouseleave") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onmouseleave attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onmouseleave attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
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

    // The pin: NO onmouseleave attribute is authored on the chip strip.
    expect(track!.hasAttribute("onmouseleave")).toBe(false);
    expect(track!.getAttribute("onmouseleave")).toBe(null);
  });
});
