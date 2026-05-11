import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pins absence of the legacy inline event-handler attribute
 * `ontouchend` on the inner chip-strip track `.lobby-chips`
 * (the `<div role="tablist">` filter rail rendered by LobbyPage.tsx).
 *
 * `ontouchend` is a legacy inline event-handler attribute. Touch-end
 * handling on the chip strip is wired through React's synthetic event
 * system (`onTouchEnd={...}` on the JSX element) — never via an inline
 * HTML attribute. An authored `ontouchend="..."` string would:
 *   1. Bypass React's synthetic event system, breaking event pooling
 *      and consistent cross-browser semantics.
 *   2. Run arbitrary inline script (CSP `unsafe-inline` smell).
 *   3. Slip past every other LobbyChipStripNo* pin, which target
 *      distinct attributes (cite, coords, accesskey, autofocus,
 *      tabindex, etc.) and do not introspect `ontouchend`.
 *
 * The pin: `track.hasAttribute("ontouchend") === false`
 * and `track.getAttribute("ontouchend") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`.
 */
describe("LobbyPage — .lobby-chips tablist has no ontouchend attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an ontouchend attribute", () => {
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

    // The pin: NO ontouchend attribute is authored on the chip strip.
    expect(track!.hasAttribute("ontouchend")).toBe(false);
    expect(track!.getAttribute("ontouchend")).toBeNull();
  });
});
