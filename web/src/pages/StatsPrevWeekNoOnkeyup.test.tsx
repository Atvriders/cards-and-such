import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul>. The HTML `onkeyup` attribute would attach an
 * inline event handler that fires when a key is released while the element
 * has focus. This presentational summary list is not interactive: it does
 * not receive focus, does not handle keyboard input, and has no associated
 * keyboard behavior. Sibling tests already pin the absence of `id`, `role`,
 * `style`, `tabindex`, `is`, `cite`, and various ARIA / global attributes
 * on this <ul>, but none pin the absence of `onkeyup`. Pinning it here
 * ensures any future change that accidentally attaches an inline keyup
 * handler — which would also introduce an inline-script CSP violation
 * surface — is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onkeyup attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onkeyup attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onkeyup")).toBe(false);
    expect(ul.getAttribute("onkeyup")).toBeNull();
  });
});
