import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1904 — pin the LobbyPage page-level <h1> via a direct
 * `container.querySelector("h1")` lookup. The sibling LobbyHeroTitle
 * test (W1202) reaches the heading through React Testing Library's
 * `getByRole("heading", { level: 1 })`, which goes through the
 * accessibility tree. This pin reaches the same node through the raw
 * DOM API, so both paths agree on the element being a real <h1> tag
 * with the expected brand copy. A regression that swapped the h1 for
 * a styled div but kept aria-level=1 would pass the role-based pin
 * yet fail this one — that is the gap this test guards.
 */
describe("LobbyPage — h1 tagName via querySelector (W1904)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("exposes the lobby title as a real <h1> element", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const h1 = container.querySelector("h1");
    expect(h1).not.toBeNull();
    expect(h1!.tagName).toBe("H1");
    expect(h1!.textContent).toBe("Cards and Such");
  });
});
