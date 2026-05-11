import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onloadstart` attribute.
 *
 * `onloadstart` is a legacy media-loading event handler attribute
 * (HTMLMediaElement / progress-event hosts such as `<audio>`,
 * `<video>`, `<img>`, `<link>`, `<script>`, XHR, etc.). On a
 * `<div role="tablist">` it is meaningless: a generic `<div>` does
 * not dispatch `loadstart` progress events, so authoring
 * `onloadstart="..."` on the chip-strip would:
 *  1. Be inert at runtime (no event will ever fire on a div).
 *  2. Trip HTML validators (Nu, html-validate) as an unknown /
 *     content-model-violating attribute on a non-media element.
 *  3. Constitute an inline event handler with arbitrary JS in
 *     attribute form — a CSP `unsafe-inline` smell and an XSS
 *     surface if any of the chip metadata is ever templated through
 *     this attribute.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. The pin asserts
 * both `hasAttribute("onloadstart") === false` AND
 * `getAttribute("onloadstart") === null` so that any regression
 * authoring `onloadstart=""` or `onloadstart="doSomething()"` is
 * caught.
 */
describe("LobbyPage — .lobby-chips tablist has no onloadstart attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onloadstart attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // The pin: NO onloadstart attribute is authored on the chip strip.
    expect(track!.hasAttribute("onloadstart")).toBe(false);
    expect(track!.getAttribute("onloadstart")).toBeNull();
  });
});
