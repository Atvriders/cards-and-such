import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `ontouchmove` attribute.
 *
 * `ontouchmove` is a legacy inline event-handler content attribute
 * for the Touch Events `touchmove` event. Authoring it as an HTML
 * attribute (e.g. `ontouchmove="handler(event)"`) is undesirable
 * here for several reasons:
 *  1. Inline event handlers couple DOM markup to global JS scope
 *     and conflict with CSP `script-src` policies that forbid
 *     inline script execution.
 *  2. The chip strip's touch/scroll behavior is mediated through
 *     React refs and passive listeners, not through inline
 *     attribute bindings — a stray `ontouchmove` attribute would
 *     introduce a parallel, unmanaged code path.
 *  3. Validators and linters flag inline event-handler attributes
 *     on accessible interactive containers as a code-smell.
 *
 * The pin: `track.hasAttribute("ontouchmove") === false` AND
 * `track.getAttribute("ontouchmove") === null`. Both primitives
 * are asserted to catch any regression that authors the attribute
 * with any value (including the empty string).
 *
 * Anchor: `document.querySelector(".lobby-chips")`.
 */
describe("LobbyPage — .lobby-chips tablist has no ontouchmove attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an ontouchmove attribute", () => {
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

    // The pin: NO ontouchmove attribute is authored on the chip strip.
    expect(track!.hasAttribute("ontouchmove")).toBe(false);
    expect(track!.getAttribute("ontouchmove")).toBe(null);
  });
});
