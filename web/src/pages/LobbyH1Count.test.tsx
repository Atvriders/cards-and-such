import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2009 — pin the total number of <h1> elements on the LobbyPage.
 * The page must expose exactly one top-level page heading. Sibling
 * tests already pin the h1's tagName (W1904), className (W1922),
 * lack of id (W2003), and textContent (W1202), but none of them
 * assert the *count*. A regression that introduced a second <h1>
 * (e.g. promoting the section header from <h2> to <h1>, or adding
 * a stray heading inside a card) would silently break document
 * outline and SEO without tripping any of the existing pins.
 *
 * This test queries the entire jsdom document — not just the render
 * container — so any h1 React produces anywhere in the tree counts.
 */
describe("LobbyPage — total h1 count (W2009)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders exactly one <h1> element on the page", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const h1s = document.querySelectorAll("h1");
    expect(h1s.length).toBe(1);
  });
});
