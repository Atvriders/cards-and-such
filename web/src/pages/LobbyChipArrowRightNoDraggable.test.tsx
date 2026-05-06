import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2793 — the chip strip's RIGHT overflow scroll-arrow button is rendered
 * without a `draggable` attribute. The arrow is a click-only scroll
 * affordance (it advances the chip strip via `onClick`), not a drag
 * source for any HTML5 drag-and-drop interaction. The default for the
 * `draggable` IDL property on a <button> is `false`, and surfacing
 * `draggable="true"` (or even `draggable="false"`) would (a) opt the
 * button into the drag-and-drop event pipeline, firing dragstart on
 * mousedown and (b) suppress the underlying text-selection behaviour
 * the browser otherwise applies — both of which subtly degrade the
 * pointer feel of the chip strip.
 *
 * Why this needs its own pin:
 *  - LobbyChipArrowRightTagName.test.tsx (W2371) pins the BUTTON tagName,
 *    LobbyChipArrowRightType.test.tsx (W1408) pins `type="button"`,
 *    LobbyChipArrowRightTabIndex.test.tsx (W1746) pins `tabIndex={-1}`,
 *    LobbyChipArrowRightNoId.test.tsx (W2444) pins the absence of `id`,
 *    and LobbyPage.test.tsx (~L2271) reads `aria-label` and `hidden`.
 *    None of those pins would notice if a refactor wired a drag handler
 *    onto the arrow and added `draggable="true"` to the markup.
 *  - The literal-attribute check (`hasAttribute`) is the right tool here:
 *    the `.draggable` IDL mirror returns `false` both when the attribute
 *    is absent AND when it is explicitly set to `"false"`, so the
 *    property-only check would silently accept `draggable="false"` as
 *    "no draggable attribute". Pinning hasAttribute catches both
 *    regressions (added-true and added-false).
 *
 * The button is rendered with `hidden` toggled by overflow geometry on
 * first paint, so we resolve it by stable BEM modifier class rather than
 * via `getByRole("button", { name })`, which skips hidden elements.
 */
describe("LobbyPage — chip-strip RIGHT arrow has no draggable attribute (W2793)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the right scroll-arrow without a draggable attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const right = document.querySelector<HTMLButtonElement>(
      ".lobby-chips-arrow--right",
    );
    expect(right).not.toBeNull();

    // Literal attribute check — true for both `draggable="true"` and
    // `draggable="false"`, which the IDL mirror would conflate with the
    // unset default.
    expect(right!.hasAttribute("draggable")).toBe(false);
    // Belt-and-braces: the IDL mirror should report the platform default
    // for a <button> with no draggable attribute, which is `false`.
    expect(right!.draggable).toBe(false);
  });
});
