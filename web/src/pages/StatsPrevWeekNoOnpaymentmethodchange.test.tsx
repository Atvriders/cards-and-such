import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins the absence of the `onpaymentmethodchange` attribute on the
 * StatsPage prior-week breakdown list (data-testid="stats-prev-week").
 *
 * `onpaymentmethodchange` is the inline-handler attribute corresponding to
 * the Payment Request API's `paymentmethodchange` event, which is only
 * meaningful on `PaymentRequest` JavaScript objects — never on a presentational
 * <ul>. Leaving such an attribute on a list element would either be silently
 * ignored or, worse, evaluated as inline script content by some HTML parsers,
 * creating a needless XSS / inline-handler surface. This regression test
 * ensures any future change that accidentally attaches an
 * `onpaymentmethodchange` attribute to this list is reviewed deliberately.
 */
describe("StatsPage stats-prev-week ul — onpaymentmethodchange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onpaymentmethodchange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.hasAttribute("onpaymentmethodchange")).toBe(false);
    expect(ul.getAttribute("onpaymentmethodchange")).toBeNull();
  });
});
