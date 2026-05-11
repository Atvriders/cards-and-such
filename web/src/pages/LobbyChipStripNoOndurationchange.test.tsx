import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pins absence of the `ondurationchange` attribute on the inner
 * chip-strip tablist track `.lobby-chips` rendered by LobbyPage.tsx.
 *
 * `ondurationchange` is an HTML event-handler content attribute fired
 * by media elements (`<audio>`, `<video>`) when their `duration`
 * property changes. On a `<div role="tablist">` it is meaningless:
 *  1. The chip strip is not a media element — it has no `duration`
 *     property and will never dispatch a `durationchange` event.
 *  2. As an inline-string event handler it would create a
 *     `Function`-from-string at parse time, defeating CSP
 *     `script-src` policies that forbid inline handlers.
 *  3. Authoring DOM event wiring belongs in React's synthetic event
 *     system (`onDurationChange` JSX prop on actual media nodes), not
 *     as a raw HTML attribute on a tablist container.
 *
 * Anchor: `document.querySelector(".lobby-chips")` — the stable
 * className keeps the pin scoped to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no ondurationchange attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an ondurationchange attribute", () => {
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

    // The pin: NO ondurationchange attribute is authored on the chip strip.
    expect(track!.hasAttribute("ondurationchange")).toBe(false);
    expect(track!.getAttribute("ondurationchange")).toBe(null);
  });
});
