import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2391 — pin that the LobbyPage hero <h1> element carries NO
 * `aria-label` attribute. The h1 supplies its own accessible name from
 * its visible text content ("Cards and Such" via the inner
 * <span class="lobby-hero-title">). Adding an `aria-label` would
 * override that visible text in the accessibility tree, which would:
 *   - violate WCAG 2.5.3 (Label in Name) when the override diverges
 *     from the visible label, and
 *   - silently break our role/text-based heading lookups elsewhere
 *     because `getByRole("heading", { name: ... })` would resolve
 *     against the override rather than the visible copy.
 *
 * Why this needs its own pin alongside the other LobbyH1* tests:
 *  - W1904 (LobbyH1Tag)        pins the element via tagName + text.
 *  - W1922 (LobbyH1Class)      pins className === "".
 *  - W2003 (LobbyH1NoId)       pins the absence of an `id` attribute.
 *  - W2222 (LobbyH1NoRole)     pins the absence of a `role` attribute.
 *  - LobbyH1NoStyle/NoTabindex/NoClassAttr cover style/tabindex/class.
 *  - None of them would catch a regression that adds an `aria-label`
 *    of any value to the heading. `hasAttribute("aria-label") === false`
 *    is the tightest possible check: no aria-label attribute, of any
 *    value, period.
 */
describe("LobbyPage — hero h1 has no aria-label attribute (W2391)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the hero <h1> without an aria-label attribute", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const h1 = container.querySelector<HTMLHeadingElement>("h1");
    expect(h1).not.toBeNull();
    expect(h1!.tagName).toBe("H1");

    // The h1 must not have an aria-label attribute of any value.
    expect(h1!.hasAttribute("aria-label")).toBe(false);
  });
});
