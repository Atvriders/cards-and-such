import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className "stats-week-list
 * stats-week-list--prev". The `onpointerlockstate` attribute is not a defined
 * HTML or DOM event-handler attribute (the related global event handler is
 * `onpointerlockchange` on Document, not an element-level IDL attribute), so
 * placing it on a <ul> would be either ignored or — if some future tooling
 * mistakenly inlined a handler under that name — silently establish an
 * unreviewed inline-script surface. Sibling tests already pin the absence of
 * many other event-handler and global attributes on this <ul>; pinning
 * `onpointerlockstate` ensures any accidental introduction is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onpointerlockstate attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onpointerlockstate attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpointerlockstate")).toBe(false);
    expect(ul.getAttribute("onpointerlockstate")).toBeNull();
  });
});
