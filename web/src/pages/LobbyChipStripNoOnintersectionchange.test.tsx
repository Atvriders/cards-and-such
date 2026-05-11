import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onintersectionchange` attribute.
 *
 * `onintersectionchange` is not a standard HTML event handler
 * content attribute. IntersectionObserver delivers its callbacks
 * via the JS `IntersectionObserver` constructor's callback
 * argument — not via an inline `onintersectionchange=""` content
 * attribute on the observed element. Authoring such an attribute on
 * the chip strip would be wrong because:
 *  1. No spec, no browser, and no framework binds an inline
 *     `onintersectionchange` content attribute to the observer
 *     callback machinery — the attribute would be silently inert.
 *  2. Validators (W3C Nu, html-validate) flag unknown
 *     `on*` content attributes as invalid, polluting CI reports.
 *  3. A stray `onintersectionchange="..."` would imply that
 *     intersection observation is wired declaratively on the
 *     element, misleading future maintainers who would expect
 *     hand-off through the JS observer API.
 *
 * Anchor: `document.querySelector(".lobby-chips")`.
 */
describe("LobbyPage — .lobby-chips tablist has no onintersectionchange attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onintersectionchange attribute", () => {
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

    // The pin: NO onintersectionchange attribute is authored on the chip strip.
    expect(track!.hasAttribute("onintersectionchange")).toBe(false);
    expect(track!.getAttribute("onintersectionchange")).toBeNull();
  });
});
