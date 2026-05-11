import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onsignaturerequestabort` attribute.
 *
 * `onsignaturerequestabort` is not a standard DOM event handler
 * attribute. It does not appear in any HTML, ARIA, or WHATWG spec,
 * and no user agent dispatches a `signaturerequestabort` event.
 * Authoring it on a `<div role="tablist">` is meaningless and would
 * be a regression — it would be an inert string attribute that
 * pollutes the DOM, confuses validators, and may be mistaken for a
 * real event handler binding by introspection tooling.
 *
 * The pin: `track.hasAttribute("onsignaturerequestabort") === false`
 * AND `track.getAttribute("onsignaturerequestabort") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. Anchoring on the
 * stable `.lobby-chips` className keeps the pin scoped to the chip
 * filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onsignaturerequestabort attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onsignaturerequestabort attribute", () => {
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

    // The pin: NO onsignaturerequestabort attribute is authored.
    expect(track!.hasAttribute("onsignaturerequestabort")).toBe(false);
    expect(track!.getAttribute("onsignaturerequestabort")).toBeNull();
  });
});
