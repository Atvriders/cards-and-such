import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1339 — the decorative magnifier glyph next to the lobby search input
 * is rendered as a <span> with the literal className `lobby-search-icon`.
 *
 * Why this needs its own pin:
 *  - `lobby-search-icon` is the sole CSS hook that absolutely-positions
 *    the magnifier inside the `.lobby-search` wrapper and matches the
 *    input's left padding. A rename (e.g. to `search-icon` or a
 *    CSS-modules hash) would silently strip the positioning while every
 *    other search-related test continued to pass — none of them inspect
 *    the icon span at all.
 *  - Sibling pins cover orthogonal contracts on the input itself (W901
 *    placeholder, W912 type, W1143 aria-label, W1248 input className,
 *    W608 clear-x button). None of those locate or assert on the icon
 *    wrapper, so a regression that drops or renames the icon span slips
 *    through CI.
 */
describe("LobbyPage — search icon className (W1339)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the search-adjacent magnifier glyph with className=\"lobby-search-icon\"", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable input test id, then walk to the wrapper
    // so the icon lookup is independent of the className under test.
    const input = screen.getByTestId("lobby-search") as HTMLInputElement;
    const wrapper = input.parentElement as HTMLElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper.classList.contains("lobby-search")).toBe(true);

    // The icon span is the first child of the .lobby-search wrapper.
    const icon = wrapper.querySelector(":scope > span");
    expect(icon).not.toBeNull();

    // Pin the literal className value. `getAttribute("class")` reads
    // the raw DOM attribute so a regression that emits an empty class
    // or a different token list fails this assertion.
    expect((icon as HTMLElement).getAttribute("class")).toBe(
      "lobby-search-icon",
    );

    // Sanity: the icon must remain a <span> (not a <div>/<i>) so
    // semantics stay inline-only inside the search wrapper.
    expect((icon as HTMLElement).tagName).toBe("SPAN");

    // Container is referenced to keep RTL's render handle alive across
    // any future Strict-Mode double-render audits.
    expect(container).toBeTruthy();
  });
});
