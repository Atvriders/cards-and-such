import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2184 — pin that the LobbyPage `.lobby-hero-title` <span> (the inner
 * gradient-styled element nested inside the hero <h1>) carries NO inline
 * `style` attribute. Its appearance — gradient text, letter spacing,
 * weight — is delivered exclusively through the `.lobby-hero-title`
 * class in CSS. Any leaked `style={{...}}` prop on this span would
 * indicate an authoring slip (or an attempt to override the gradient
 * inline) that should fail review.
 *
 * Why a dedicated pin:
 *  - Sibling pin LobbyH1NoStyle (W2110) only asserts the parent <h1>,
 *    not the inner span where the gradient styling actually lives. A
 *    regression could land an inline `style` on the span without ever
 *    touching the h1, slipping past every existing assertion.
 *  - `hasAttribute("style") === false` is tighter than reading
 *    `style.cssText`: React only emits a `style` attribute when at
 *    least one inline style is set, so absence of the attribute is the
 *    cleanest signal that no inline overrides have been introduced.
 */
describe("LobbyPage — hero-title span has no style attribute (W2184)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the .lobby-hero-title span without a style attribute", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const el = container.querySelector<HTMLSpanElement>(".lobby-hero-title");
    expect(el).not.toBeNull();
    expect(el!.tagName).toBe("SPAN");

    // The span must not have a `style` attribute of any value.
    expect(el!.hasAttribute("style")).toBe(false);
  });
});
