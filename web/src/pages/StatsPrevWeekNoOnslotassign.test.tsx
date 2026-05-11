import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul>. The `onslotassign` event handler attribute
 * is only meaningful on <slot> elements inside shadow DOM, where it fires
 * when the slot's assigned nodes change. On a <ul> this attribute carries
 * no defined semantics, but leaving it present would attach an inert event
 * handler that could be misread by future refactors or tooling. Sibling
 * tests pin the absence of many other attributes on this <ul>; this test
 * pins the absence of `onslotassign` so any future change that attaches
 * such a handler to this presentational summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onslotassign attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onslotassign attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onslotassign")).toBe(false);
    expect(ul.getAttribute("onslotassign")).toBeNull();
  });
});
