import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onsearch` attribute.
 *
 * `onsearch` is a legacy event-handler content attribute whose only
 * spec-defined host is `<input type="search">` — it fires when the
 * user invokes the search action on a search input (e.g. submitting
 * an incremental-search field, historically a WebKit-specific event).
 * On a `<div role="tablist">` it is meaningless:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not a search input and emits no `search` event.
 *  2. Authoring `onsearch="..."` as an inline event handler also
 *     introduces an inline-script execution sink, which is hostile to
 *     strict CSP (`script-src 'self'` without `'unsafe-inline'`).
 *  3. Validators and linters flag inline event handlers on
 *     non-applicable elements as both invalid and a CSP smell.
 *
 * The pin: `track.hasAttribute("onsearch") === false`
 *          and `track.getAttribute("onsearch") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className keeps the pin scoped specifically
 * to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onsearch attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onsearch attribute", () => {
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

    // The pin: NO onsearch attribute is authored on the chip strip.
    expect(track!.hasAttribute("onsearch")).toBe(false);
    expect(track!.getAttribute("onsearch")).toBeNull();
  });
});
