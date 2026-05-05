import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1746 — the chip strip's RIGHT overflow arrow button is intentionally
 * removed from the keyboard tab order via `tabIndex={-1}`.
 *
 * Why this needs its own pin:
 *  - LobbyChipArrowLeftTabIndex.test.tsx (W1328) pins the LEFT arrow's
 *    `tabIndex={-1}`, but the two arrows are independently declared in
 *    JSX with their own literal `tabIndex={-1}` props, so a regression
 *    on the right one would not be caught by the left-arrow assertion.
 *  - LobbyChipArrowRightType.test.tsx (W1408) inspects only the right
 *    arrow's `type="button"`. LobbyPage.test.tsx (~L2271) inspects only
 *    the right arrow's `aria-label` and `hidden` flag. Nothing reads
 *    the right arrow's tabIndex.
 *  - Removing or re-typing the `tabIndex` (e.g. dropping it, or letting
 *    it fall back to `0`) would silently re-introduce the arrow into
 *    the focus ring. Keyboard users would then have to tab through two
 *    decorative scroll affordances before reaching the first real chip,
 *    which is the precise behaviour the explicit `-1` was added to
 *    prevent — chip navigation is handled via roving-tabindex on the
 *    chips themselves, not via the decorative arrow controls.
 *
 * The button is rendered with `hidden` toggled by overflow geometry,
 * but the tabIndex is unconditional in the source — so we resolve it
 * by class selector rather than `getByRole("button", { name })`, which
 * would skip elements whose `hidden` attribute is set on first paint.
 */
describe("LobbyPage — chip-strip RIGHT arrow tabIndex (W1746)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("removes the right scroll-arrow from the tab order with tabIndex=-1", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve by stable BEM modifier class so the lookup is independent
    // of the attribute under test, and succeeds even when the button is
    // rendered with `hidden` (which would hide it from accessibility-tree
    // queries like getByRole).
    const right = document.querySelector<HTMLButtonElement>(
      ".lobby-chips-arrow--right",
    );
    expect(right).not.toBeNull();

    // Read the literal DOM attribute. React serialises the numeric
    // `tabIndex={-1}` prop to the string "-1" on the rendered element,
    // so an exact string match pins both the value and the presence of
    // the attribute. The `.tabIndex` property mirror is asserted too so
    // the test fails distinctly if the attribute is dropped vs. retyped.
    expect(right!.getAttribute("tabindex")).toBe("-1");
    expect(right!.tabIndex).toBe(-1);
  });
});
