import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2814 — the chip strip's LEFT overflow scroll-arrow button is rendered
 * without a literal `style` attribute. Visual presentation (size, glyph
 * positioning, the gradient fade that hints there is more content) is
 * delivered exclusively by the `.lobby-chips-arrow` and
 * `.lobby-chips-arrow--left` BEM classes in LobbyPage.css. No inline
 * style is required to make the affordance work, and historically the
 * arrow's only "dynamic" presentation concern — whether it should be
 * shown at all — is expressed via the `hidden` boolean attribute
 * (driven by `canLeft`), not via an inline `style.display` toggle.
 *
 * Why this needs its own pin:
 *  - LobbyChipArrowLeftTagName.test.tsx (W2435) pins the BUTTON tagName,
 *    LobbyChipArrowLeftType.test.tsx (W2313) pins `type="button"`,
 *    LobbyChipArrowLeftTabIndex.test.tsx (W1328) pins `tabIndex={-1}`,
 *    LobbyChipArrowLeftAria.test.tsx (W1319) pins the aria-label,
 *    LobbyChipArrowLeftNoId.test.tsx (W2452) pins id-absence, and
 *    LobbyChipArrowLeftNoDraggable.test.tsx (W2791) pins draggable
 *    absence. None of those would notice if a stray `style={{ ... }}`
 *    prop crept onto this button — for example, a "fix" that tried to
 *    paper over a layout regression by inlining `style={{ display:
 *    canLeft ? "" : "none" }}` instead of (or in addition to) the
 *    existing `hidden={!canLeft}`. That kind of regression is exactly
 *    the failure mode we want pinned: it would silently weaken
 *    cascadable styling, defeat any future attempt to theme the arrow
 *    via CSS variables, and create a second source of truth for
 *    visibility that disagrees with the `hidden` attribute on first
 *    paint.
 *  - React's CSSStyleDeclaration is always present on the DOM node, so
 *    a property check (`left!.style.cssText === ""`) would pass even
 *    when the JSX rendered `style={{}}` (empty object), which still
 *    materializes as `style=""` in the serialized HTML. Pinning
 *    `hasAttribute("style")` is the literal-attribute check and is the
 *    only way to catch the empty-object regression as well as any
 *    populated inline rule.
 *
 * The button is rendered with `hidden` toggled by overflow geometry,
 * so we resolve it by stable BEM modifier class rather than via
 * `getByRole("button", { name })`, which would skip elements whose
 * `hidden` attribute is set on first paint.
 */
describe("LobbyPage — chip-strip LEFT arrow has no style attribute (W2814)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the left scroll-arrow without a style attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const left = document.querySelector<HTMLButtonElement>(
      ".lobby-chips-arrow--left",
    );
    expect(left).not.toBeNull();

    // hasAttribute is the literal-attribute check: it returns true for
    // any inline style — `style="display:none"`, `style=""` (empty
    // object passed to React), or any populated CSS rule. Visual
    // styling for this button is owned entirely by the BEM classes in
    // LobbyPage.css, so the source omits the attribute entirely.
    expect(left!.hasAttribute("style")).toBe(false);
  });
});
