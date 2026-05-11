import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `oninvalid` attribute is
 * an event handler content attribute defined for form-associated elements
 * (e.g. <input>, <select>, <textarea>) that fires when constraint validation
 * fails. It has no defined semantics on a <ul> and, if present, would install
 * an inline event handler string parsed as JavaScript — a pattern that both
 * violates strict CSP and is meaningless on a presentational list. Sibling
 * tests pin the absence of many other unexpected attributes on this element;
 * pinning the absence of `oninvalid` here ensures any future change that
 * accidentally attaches an inline invalid handler to this list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — oninvalid attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no oninvalid attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("oninvalid")).toBe(false);
    expect(ul.getAttribute("oninvalid")).toBeNull();
  });
});
