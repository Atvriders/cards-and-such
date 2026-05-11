import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onlanguagechangechanged` attribute.
 *
 * `onlanguagechangechanged` is not a real DOM event handler — the
 * legitimate window-level event is `languagechange` (handler:
 * `onlanguagechange`). A doubled-suffix variant like
 * `onlanguagechangechanged` is therefore nonsense: no user agent
 * dispatches such an event, no spec defines it, and authoring it
 * inline on a `<div role="tablist">` would only serve to:
 *  1. Bloat the DOM with a dead inline handler string.
 *  2. Confuse static analyzers / a11y tooling that introspect
 *     element attribute sets and may attempt to parse unknown
 *     `on*` attributes as event bindings.
 *  3. Mask a real bug — if anyone ever needs to react to locale
 *     changes they should attach `window.addEventListener(
 *     "languagechange", ...)`, not bolt a fictional inline
 *     attribute onto a tablist.
 *
 * Anchor: `document.querySelector(".lobby-chips")`.
 * The pin: `hasAttribute("onlanguagechangechanged") === false`
 * AND `getAttribute("onlanguagechangechanged") === null`.
 */
describe("LobbyPage — .lobby-chips tablist has no onlanguagechangechanged attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onlanguagechangechanged attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // The pin: NO onlanguagechangechanged attribute is authored on
    // the chip strip. Both presence and value channels are asserted.
    expect(track!.hasAttribute("onlanguagechangechanged")).toBe(false);
    expect(track!.getAttribute("onlanguagechangechanged")).toBeNull();
  });
});
