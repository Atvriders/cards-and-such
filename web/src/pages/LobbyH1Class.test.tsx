import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1922 — pin the LobbyPage hero <h1> element's exact `className`
 * string. The h1 deliberately carries NO class of its own; all of
 * the gradient/styling lives on the nested `<span class="lobby-hero-title">`
 * inside it. That keeps the heading itself semantically clean while the
 * span absorbs the visual chrome.
 *
 * Why this needs its own pin:
 *  - W1202 (LobbyHeroTitle) asserts the heading exists via
 *    `getByRole("heading", { level: 1 })` and pins the text "Cards and Such".
 *  - W1212 covers the same heading via role lookup.
 *  - W1904 (LobbyH1Tag) reaches the h1 via raw `container.querySelector("h1")`
 *    and pins `tagName === "H1"` plus textContent.
 *  - W1888 (LobbyHeroHeaderClass) pins the surrounding <header>'s className,
 *    not the h1 itself.
 *  - None of those guard against a regression that *adds* a className to
 *    the <h1> (e.g. moving the gradient styling up off the inner span and
 *    onto the heading itself, or accidentally interpolating a state modifier).
 *    Such a change would shift the cascade target of LobbyPage.css rules
 *    keyed off `.lobby-hero-title` and silently break the gradient.
 *
 * The h1 element should have className === "" (empty string).
 */
describe("LobbyPage — hero h1 className equality (W1922)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the hero <h1> with an empty className string", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const h1 = container.querySelector<HTMLHeadingElement>("h1");
    expect(h1).not.toBeNull();
    expect(h1!.tagName).toBe("H1");

    // The styling lives on the inner <span class="lobby-hero-title">,
    // so the h1 itself must carry NO classes.
    expect(h1!.className).toBe("");
  });
});
