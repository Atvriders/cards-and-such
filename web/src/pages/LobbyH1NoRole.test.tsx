import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2222 — pin that the LobbyPage hero <h1> element carries NO `role`
 * attribute. A native <h1> already has the implicit ARIA role of
 * "heading" with aria-level=1; adding an explicit `role="..."` would
 * either be redundant (role="heading") or, worse, would override the
 * implicit semantics and break assistive-tech navigation and any of
 * our existing tests that look the heading up via `getByRole`.
 *
 * Why this needs its own pin:
 *  - W1922 (LobbyH1Class)   pins className === "".
 *  - W1904 (LobbyH1Tag)     pins the element via tagName.
 *  - W2003 (LobbyH1NoId)    pins the absence of an `id` attribute.
 *  - W1202 / W1212          assert the heading exists *by role* and
 *                           pin its text — they rely on the implicit
 *                           role and would silently keep passing even
 *                           if a redundant `role="heading"` were added.
 *  - None of those would catch a regression that adds an explicit
 *    `role` attribute (of any value) to the heading.
 *    `hasAttribute("role") === false` is the tightest possible check:
 *    no role attribute, of any value, period.
 */
describe("LobbyPage — hero h1 has no role attribute (W2222)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the hero <h1> without a role attribute", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const h1 = container.querySelector<HTMLHeadingElement>("h1");
    expect(h1).not.toBeNull();
    expect(h1!.tagName).toBe("H1");

    // The h1 must not have a role attribute of any value.
    expect(h1!.hasAttribute("role")).toBe(false);
  });
});
