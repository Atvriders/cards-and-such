import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * The inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onuncapturederror` attribute.
 *
 * `onuncapturederror` is an event-handler content attribute. Authoring
 * it inline on a `<div role="tablist">` would be wrong because:
 *  1. The chip strip is a presentational/scroll container of
 *     `role="tab"` buttons — it has no business owning a global
 *     error-handling event hook.
 *  2. Inline `on*` attributes execute as strings via the HTML parser
 *     and bypass React's synthetic event system, defeating both
 *     CSP `script-src` policies and React's event delegation.
 *  3. A stray `onuncapturederror="..."` would be an exfiltration /
 *     XSS vector if any user-controlled string ever flowed into the
 *     attribute.
 *
 * The pin: `track.hasAttribute("onuncapturederror") === false` AND
 * `track.getAttribute("onuncapturederror") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`.
 */
describe("LobbyPage — .lobby-chips tablist has no onuncapturederror attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onuncapturederror attribute", () => {
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

    // The pin: NO onuncapturederror attribute authored on the chip strip.
    expect(track!.hasAttribute("onuncapturederror")).toBe(false);
    expect(track!.getAttribute("onuncapturederror")).toBe(null);
  });
});
