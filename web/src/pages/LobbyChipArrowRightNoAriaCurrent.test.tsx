import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2843 — the chip strip's RIGHT overflow scroll-arrow button is rendered
 * WITHOUT an `aria-current` attribute. The arrow is a viewport scroll
 * affordance (it nudges the chip-strip horizontally), not a navigation /
 * pagination / step indicator. `aria-current` is reserved by ARIA 1.1+
 * for marking the element representing the current item within a set
 * (current page, current step, current location, etc.) — applying it to
 * a scroll button would mis-classify the arrow as a positional indicator
 * and pollute screen-reader output with a spurious "current" announcement
 * on every render.
 *
 * Why this needs its own pin:
 *  - Sibling LobbyChipArrowRight*.test.tsx files cover other absent /
 *    present attributes:
 *      W1408 — type="button"
 *      W1746 — tabIndex={-1}
 *      W2371 — tagName === BUTTON
 *      W2444 — no `id`
 *      W2793 — no `draggable`
 *      W2816 — no inline `style`
 *    Plus LobbyChipArrowRightNoLang / NoName cover other no-attribute
 *    contracts. None of them would catch an `aria-current="true"` (or
 *    any other token value) being added to the right scroll-arrow.
 *  - The matching LEFT arrow has analogous pins; this file specifically
 *    locks down the RIGHT arrow because the two buttons are independently
 *    rendered (different className, different click handler, different
 *    `hidden` predicate) and a refactor could plausibly touch only one.
 *
 * What adding `aria-current` here would silently break:
 *   1. Screen-reader UX: NVDA / JAWS / VoiceOver will append "current page"
 *      (or the matching token) to the button's accessible name on every
 *      focus / virtual-cursor pass, even though the arrow has no
 *      positional semantics.
 *   2. Automated accessibility audits (axe-core rule `aria-valid-attr-value`
 *      and Lighthouse a11y category) flag spurious `aria-current` on
 *      controls that aren't part of a navigational set.
 *   3. CSS that legitimately styles `[aria-current]` elsewhere on the
 *      page (e.g. nav links) would unexpectedly apply to the scroll arrow.
 *
 * The button is rendered with `hidden` toggled by overflow geometry on
 * first paint, so we resolve it by stable BEM modifier class via
 * `document.querySelector` rather than via `getByRole("button", { name })`,
 * which skips hidden elements (matching the resolution strategy used in
 * sibling LobbyChipArrowRight*.test.tsx files).
 *
 * `hasAttribute` is the literal-attribute check: an `aria-current=""` or
 * `aria-current="false"` would still be a (broken) public surface that
 * assistive technology and audit tooling could react to. Reading via
 * `getAttribute` and comparing to null would equally work, but
 * `hasAttribute` is the clearest single-purpose assertion of "this
 * attribute is not on the element at all".
 */
describe("LobbyPage — chip-strip RIGHT arrow has no aria-current attribute (W2843)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the right scroll-arrow without an aria-current attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const right = document.querySelector<HTMLButtonElement>(
      ".lobby-chips-arrow--right",
    );
    expect(right).not.toBeNull();

    // Sanity: confirm the resolved node is the actual <button>, not a
    // descendant or wrapper that happens to share the modifier class.
    // Without this guard a future restructure could pass the assertion
    // vacuously by moving the class onto a non-aria-current wrapper.
    expect(right!.tagName).toBe("BUTTON");

    // The actual contract: no `aria-current` attribute on the right arrow.
    expect(right!.hasAttribute("aria-current")).toBe(false);
  });
});
