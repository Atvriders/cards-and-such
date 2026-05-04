import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1328 — the chip strip's LEFT overflow arrow button is intentionally
 * removed from the keyboard tab order via `tabIndex={-1}`.
 *
 * Why this needs its own pin:
 *  - LobbyChipArrowLeftAria.test.tsx (W1319) discusses the arrow being
 *    "keyboard-skipped (`tabIndex={-1}`)" in its rationale comment but
 *    only asserts the `aria-label` literal — the tabIndex itself is
 *    never read. LobbyPage.test.tsx (~L2263) selects the same node by
 *    class but only inspects `.hidden` and the right arrow's aria-label.
 *  - Removing or re-typing the `tabIndex` (e.g. dropping it, or letting
 *    it fall back to `0`) would silently re-introduce the arrow into
 *    the focus ring. Keyboard users would then have to tab through two
 *    decorative scroll affordances before reaching the first real chip,
 *    which is the precise behaviour the explicit `-1` was added to
 *    prevent.
 *  - The two arrows are independently declared in JSX with their own
 *    literal `tabIndex={-1}` props, so a regression on the left one
 *    would not be caught by any right-arrow assertion.
 *
 * The button is rendered with `hidden` toggled by overflow geometry,
 * but the tabIndex is unconditional in the source — so we resolve it
 * by class selector rather than `getByRole("button", { name })`, which
 * would skip elements whose `hidden` attribute is set on first paint.
 */
describe("LobbyPage — chip-strip LEFT arrow tabIndex (W1328)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("removes the left scroll-arrow from the tab order with tabIndex=-1", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve by stable BEM modifier class so the lookup is independent
    // of the attribute under test, and succeeds even when the button is
    // rendered with `hidden` (which would hide it from accessibility-tree
    // queries like getByRole).
    const left = document.querySelector<HTMLButtonElement>(
      ".lobby-chips-arrow--left",
    );
    expect(left).not.toBeNull();

    // Read the literal DOM attribute. React serialises the numeric
    // `tabIndex={-1}` prop to the string "-1" on the rendered element,
    // so an exact string match pins both the value and the presence of
    // the attribute. The `.tabIndex` property mirror is asserted too so
    // the test fails distinctly if the attribute is dropped vs. retyped.
    expect(left!.getAttribute("tabindex")).toBe("-1");
    expect(left!.tabIndex).toBe(-1);
  });
});
