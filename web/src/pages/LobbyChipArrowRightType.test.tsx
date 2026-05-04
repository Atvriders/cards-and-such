import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1408 — the chip strip's RIGHT overflow arrow button declares
 * `type="button"` explicitly in the JSX so it never accidentally
 * inherits the default `type="submit"` behaviour when nested inside
 * a future <form> ancestor.
 *
 * Why this needs its own pin:
 *  - LobbyPage.test.tsx (~L2271) already pins the RIGHT arrow's
 *    `aria-label="Scroll filters right"` and its `hidden` flag, but
 *    nothing asserts the explicit `type="button"` attribute. The
 *    aria-label test alone would still pass if the literal `type`
 *    attribute were dropped from the JSX, silently regressing the
 *    button into a submit-by-default control.
 *  - The right arrow lives inside a wrapper that, in principle, could
 *    be embedded under a <form> in the future (e.g. if filters become
 *    a search form). An implicit-submit regression there would cause
 *    the page to refresh on every nudge — a hard-to-diagnose UX bug.
 *
 * Like the existing left/right pins we resolve the button via its
 * stable BEM modifier class so the lookup is independent of the
 * attribute under test and works even when the button is rendered
 * with `hidden` (which hides it from accessibility-tree queries).
 */
describe("LobbyPage — chip-strip RIGHT arrow type attribute (W1408)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("declares the right scroll-arrow with type=\"button\"", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const right = document.querySelector<HTMLButtonElement>(
      ".lobby-chips-arrow--right",
    );
    expect(right).not.toBeNull();

    // Pin the literal attribute value via getAttribute so we read
    // what was rendered into the DOM, not the HTMLButtonElement.type
    // IDL property which coerces missing/invalid values to "submit".
    expect(right!.getAttribute("type")).toBe("button");
  });
});
