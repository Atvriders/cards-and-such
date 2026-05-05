import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2098 — pin that the LobbyPage hero <h1> element carries NO `class`
 * attribute at all. React does not emit a `class=""` attribute when
 * className is the empty string — it omits the attribute entirely.
 * This test pins that contract at the DOM-attribute level.
 *
 * Why this needs its own pin (separate from W1922):
 *  - W1922 (LobbyH1Class) asserts `h1.className === ""`. That string
 *    comparison is satisfied both when React emits no `class` attribute
 *    *and* when an empty `class=""` attribute is present (HTMLElement's
 *    className reflects "" in both cases).
 *  - This pin uses `hasAttribute("class") === false`, which is strictly
 *    tighter: it fails the moment any code adds even an empty `class=""`
 *    attribute, catching regressions that W1922 would silently allow.
 *  - Keeping the h1 attribute-clean preserves the heading as a pure
 *    semantic element styled solely via the parent (.lobby-hero) and
 *    the inner <span class="lobby-hero-title">.
 */
describe("LobbyPage — hero h1 has no class attribute (W2098)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the hero <h1> without a class attribute", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const h1 = container.querySelector<HTMLHeadingElement>("h1");
    expect(h1).not.toBeNull();
    expect(h1!.tagName).toBe("H1");

    // The h1 must not have a `class` attribute of any value (not even "").
    expect(h1!.hasAttribute("class")).toBe(false);
  });
});
