import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2003 — pin that the LobbyPage hero <h1> element carries NO `id`
 * attribute. The heading is intentionally addressed via role/tagName
 * rather than via id, so adding one would create a stable hash anchor
 * that other code (e.g. skip-links, deep-link targets, scroll-spy) might
 * start to rely on. Pinning its absence keeps that contract explicit.
 *
 * Why this needs its own pin:
 *  - W1922 (LobbyH1Class) pins the h1's className (must be "").
 *  - W1904 (LobbyH1Tag) pins the h1 via raw querySelector + tagName.
 *  - W1202 / W1212 assert the heading exists by role and pin its text.
 *  - None of those guard against a regression that *adds* an `id`
 *    attribute to the heading. `hasAttribute("id") === false` is the
 *    tightest possible check: no id, of any value, period.
 */
describe("LobbyPage — hero h1 has no id attribute (W2003)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the hero <h1> without an id attribute", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const h1 = container.querySelector<HTMLHeadingElement>("h1");
    expect(h1).not.toBeNull();
    expect(h1!.tagName).toBe("H1");

    // The h1 must not have an id attribute of any value.
    expect(h1!.hasAttribute("id")).toBe(false);
  });
});
