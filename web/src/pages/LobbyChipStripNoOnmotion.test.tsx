import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onmotion` attribute.
 *
 * `onmotion` is not a defined HTML/DOM event handler attribute. It is
 * neither a standard global event handler (like `onclick`, `onkeydown`)
 * nor a recognized ARIA / framework attribute. Authoring it on the
 * chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — there is no "motion" lifecycle event in the platform
 *     for which `onmotion` would be a handler binding.
 *  2. Validators (W3C Nu, html-validate) flag unknown `on*` handlers
 *     on HTML elements as invalid attributes, polluting CI reports.
 *  3. A stray `onmotion="..."` would silently never fire (no event
 *     dispatches under that name), masking what the author may have
 *     intended (e.g. a custom motion / animation hook).
 *
 * Anchor: `document.querySelector(".lobby-chips")`.
 */
describe("LobbyPage — .lobby-chips tablist has no onmotion attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onmotion attribute", () => {
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

    // The pin: NO onmotion attribute is authored on the chip strip.
    expect(track!.hasAttribute("onmotion")).toBe(false);
    expect(track!.getAttribute("onmotion")).toBe(null);
  });
});
