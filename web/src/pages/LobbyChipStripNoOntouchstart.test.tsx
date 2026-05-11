import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `ontouchstart` attribute.
 *
 * `ontouchstart` is a legacy inline event-handler attribute used to
 * bind a touchstart listener directly in HTML. Authoring it on the
 * chip strip would be wrong because:
 *  1. Inline event handlers stringify to global-scope function bodies
 *     evaluated by the user agent, which is incompatible with the
 *     project's React event model (synthetic events, bubbling, etc.).
 *  2. CSP and lint rules in this repo forbid inline event handlers;
 *     a stray `ontouchstart="..."` would fail CSP and pollute audits.
 *  3. The chip strip already wires its scroll/touch behavior in
 *     `LobbyPage.tsx` via refs and React handlers — duplicating that
 *     via an inline attribute would create handler drift.
 *
 * The pin: `track.hasAttribute("ontouchstart") === false` and
 * `track.getAttribute("ontouchstart") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`.
 */
describe("LobbyPage — .lobby-chips tablist has no ontouchstart attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an ontouchstart attribute", () => {
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

    // The pin: NO ontouchstart inline event handler attribute.
    expect(track!.hasAttribute("ontouchstart")).toBe(false);
    expect(track!.getAttribute("ontouchstart")).toBeNull();
  });
});
