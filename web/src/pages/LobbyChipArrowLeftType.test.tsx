import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2313 — the chip strip's LEFT overflow arrow button declares
 * `type="button"` explicitly in the JSX so it never accidentally
 * inherits the default `type="submit"` behaviour when nested inside
 * a future <form> ancestor.
 *
 * Why this needs its own pin:
 *  - LobbyChipArrowRightType.test.tsx (W1408) pins the RIGHT arrow's
 *    `type="button"` attribute, but the two arrows are independently
 *    declared in the JSX with their own literal `type="button"` props.
 *    A regression that dropped the attribute on only the LEFT arrow
 *    (e.g. via a careless refactor that consolidated only one button)
 *    would slip past the right-arrow assertion.
 *  - LobbyChipArrowLeftAria.test.tsx (W1319) pins the LEFT arrow's
 *    `aria-label` and LobbyChipArrowLeftTabIndex.test.tsx (W1328) pins
 *    its `tabIndex={-1}`, but neither reads the `type` attribute. The
 *    aria-label / tabIndex tests would still pass if the literal
 *    `type` attribute were dropped from the JSX, silently regressing
 *    the button into a submit-by-default control.
 *  - The left arrow lives inside the same wrapper as the right arrow,
 *    which in principle could be embedded under a <form> in the future
 *    (e.g. if filters become a search form). An implicit-submit
 *    regression there would cause the page to refresh on every nudge —
 *    a hard-to-diagnose UX bug.
 *
 * Like the existing left/right pins we resolve the button via its
 * stable BEM modifier class so the lookup is independent of the
 * attribute under test and works even when the button is rendered
 * with `hidden` (which hides it from accessibility-tree queries).
 */
describe("LobbyPage — chip-strip LEFT arrow type attribute (W2313)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("declares the left scroll-arrow with type=\"button\"", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const left = document.querySelector<HTMLButtonElement>(
      ".lobby-chips-arrow--left",
    );
    expect(left).not.toBeNull();

    // Pin the literal attribute value via getAttribute so we read
    // what was rendered into the DOM, not the HTMLButtonElement.type
    // IDL property which coerces missing/invalid values to "submit".
    expect(left!.getAttribute("type")).toBe("button");
  });
});
