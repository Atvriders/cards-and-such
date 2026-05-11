import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onsecuritypolicyviolationchanged` attribute.
 *
 * `onsecuritypolicyviolationchanged` is not a standard HTML event
 * handler attribute. The legitimate CSP-violation event handler is
 * `onsecuritypolicyviolation` (fires `SecurityPolicyViolationEvent`
 * when the page violates its Content-Security-Policy). A "changed"
 * suffix variant is not part of any spec — it would be authored only
 * as the result of a typo, an over-zealous templating helper, or a
 * stray event-name-mangling script.
 *
 * Authoring `onsecuritypolicyviolationchanged` on the chip strip
 * would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it has no relationship to Content-Security-Policy
 *     events, which are document/window-scoped concerns.
 *  2. The attribute is not a recognized event handler IDL attribute,
 *     so it will never wire up to anything; it is dead weight DOM
 *     noise that confuses event-handler introspection (e.g.
 *     `getEventListeners`, devtools event-listener panels,
 *     automated event-attribute crawlers).
 *  3. Validators (W3C Nu, html-validate) flag unknown `on*`
 *     attributes as suspicious, polluting CI accessibility / lint
 *     reports.
 *
 * The pin: `track.hasAttribute("onsecuritypolicyviolationchanged")
 * === false` AND
 * `track.getAttribute("onsecuritypolicyviolationchanged") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`.
 */
describe("LobbyPage — .lobby-chips tablist has no onsecuritypolicyviolationchanged attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onsecuritypolicyviolationchanged attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: we are looking at the chip-strip tablist track, not
    // some other element.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO onsecuritypolicyviolationchanged attribute is
    // authored on the chip strip.
    expect(track!.hasAttribute("onsecuritypolicyviolationchanged")).toBe(false);
    expect(track!.getAttribute("onsecuritypolicyviolationchanged")).toBeNull();
  });
});
