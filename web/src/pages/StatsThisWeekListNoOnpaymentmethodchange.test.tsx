import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onpaymentmethodchange` event handler attribute belongs to the Payment
 * Request API surface and has no defined behavior on a <ul>. Setting it as a
 * content attribute would expose an inline event-handler-style string in
 * the serialized DOM, potentially confusing assistive technology, crawlers,
 * or future refactors. This test pins its absence so any future change that
 * accidentally attaches `onpaymentmethodchange` to this presentational weekly
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onpaymentmethodchange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onpaymentmethodchange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpaymentmethodchange")).toBe(false);
    expect(ul.getAttribute("onpaymentmethodchange")).toBeNull();
  });
});
