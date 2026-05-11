import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onresizechanged` attribute.
 *
 * `onresizechanged` is not a standard HTML event handler attribute —
 * it has no defined semantics on any element, and certainly not on a
 * `<div role="tablist">`. Authoring it would be wrong because:
 *  1. It is not a recognized event handler IDL attribute on
 *     HTMLElement, so no user agent will wire it to a listener.
 *  2. Validators will flag it as an unknown attribute, polluting CI
 *     reports.
 *  3. A stray inline handler string would imply behavior that simply
 *     does not exist, confusing future maintainers.
 *
 * The pin: `track.hasAttribute("onresizechanged") === false` AND
 * `track.getAttribute("onresizechanged") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className keeps the pin scoped specifically
 * to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onresizechanged attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onresizechanged attribute", () => {
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

    // The pin: NO onresizechanged attribute is authored.
    expect(track!.hasAttribute("onresizechanged")).toBe(false);
    expect(track!.getAttribute("onresizechanged")).toBeNull();
  });
});
