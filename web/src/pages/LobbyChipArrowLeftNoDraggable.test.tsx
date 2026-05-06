import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2791 — the chip strip's LEFT overflow scroll-arrow button is rendered
 * without a literal `draggable` attribute. The button is a click/tap
 * affordance for nudging the chip track horizontally; making it the
 * source of an HTML5 drag-and-drop gesture would be both semantically
 * wrong (it is not a payload, it is a control) and would interfere with
 * the parent track's pointer-driven scroll model on touch devices, where
 * `draggable="true"` opts the element into the native drag image and
 * suppresses the click that the nudge handler relies on.
 *
 * Why this needs its own pin:
 *  - LobbyChipArrowLeftTagName.test.tsx (W2435) pins the BUTTON tagName,
 *    LobbyChipArrowLeftType.test.tsx (W2313) pins `type="button"`,
 *    LobbyChipArrowLeftTabIndex.test.tsx (W1328) pins `tabIndex={-1}`,
 *    LobbyChipArrowLeftAria.test.tsx (W1319) pins the aria-label, and
 *    LobbyChipArrowLeftNoId.test.tsx (W2452) pins id-absence. None of
 *    those would notice if a stray `draggable="true"` regressed onto
 *    this button (e.g. via a copy-pasted DnD-list refactor or via a
 *    shared button base component that started defaulting `draggable`).
 *  - HTMLElement's `draggable` IDL property defaults to `false` for
 *    BUTTON in jsdom regardless of attribute presence, so a property
 *    check alone (`left!.draggable === false`) would pass even if the
 *    JSX literally rendered `draggable={true}` and React reflected it
 *    incorrectly. Pinning `hasAttribute("draggable")` catches both the
 *    `draggable` and `draggable="false"` regressions: any literal
 *    attribute presence would flip the assertion.
 *
 * The button is rendered with `hidden` toggled by overflow geometry, so
 * we resolve it by stable BEM modifier class rather than via
 * `getByRole("button", { name })`, which would skip elements whose
 * `hidden` attribute is set on first paint.
 */
describe("LobbyPage — chip-strip LEFT arrow has no draggable attribute (W2791)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the left scroll-arrow without a draggable attribute", () => {
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
    // both `draggable` (boolean-ish) and `draggable="false"` (explicit
    // opt-out). Either form would imply the JSX deliberately surfaced
    // the attribute, which is the regression we want to catch — the
    // source omits it entirely so the element inherits the BUTTON
    // default of non-draggable.
    expect(left!.hasAttribute("draggable")).toBe(false);
  });
});
