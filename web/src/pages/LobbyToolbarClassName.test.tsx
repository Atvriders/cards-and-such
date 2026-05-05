import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2354 — the lobby toolbar wrapper carries exactly the single CSS
 * class `lobby-toolbar` and nothing else. The class is the lone hook
 * that the stylesheet keys off (gap, alignment, overflow handling on
 * narrow viewports), so any additional or alternate class would be a
 * silent layout regression.
 *
 * Why this needs its own pin:
 *  - Sibling pins cover role (W1393), aria-label (W1381), tagName
 *    (LobbyFilterBarTag), absence of id/style/tabindex. None of them
 *    observes className, so a refactor that sprinkled e.g.
 *    `lobby-toolbar lobby-toolbar--wide` or replaced the class with
 *    a utility soup ("flex gap-2 items-center") would slip through
 *    every existing test while breaking the CSS contract.
 *  - Pinning the exact string (rather than `toContain("lobby-toolbar")`)
 *    is intentional: the stylesheet's selector specificity assumes the
 *    element is keyed by this single class. Adding modifier classes
 *    is itself the regression we want to catch.
 *
 * The lookup uses the stable `data-testid` so the assertion is not
 * coupled to the attribute under test — we observe `className` only
 * after we have already located the element by some other handle.
 */
describe("LobbyPage — toolbar className (W2354)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the toolbar wrapper with exactly the lobby-toolbar class", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const toolbar = screen.getByTestId("lobby-toolbar");

    // getAttribute("class") returns the literal class attribute string
    // as authored, with no React-side normalisation, so this is the
    // strictest equality check available short of innerHTML diffing.
    expect(toolbar.getAttribute("class")).toBe("lobby-toolbar");
  });
});
