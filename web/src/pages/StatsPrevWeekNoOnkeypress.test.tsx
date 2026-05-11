import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain presentational <ul>. The HTML `onkeypress` attribute
 * is a legacy inline event handler that is deprecated in modern HTML and
 * should never appear on a presentational summary list. If it ever did
 * appear, it would execute arbitrary script content from the DOM, which is
 * both a security and accessibility concern. Sibling tests pin the absence
 * of many other event handler and global attributes on this <ul>, but none
 * pin the absence of `onkeypress`. This test ensures any future change that
 * accidentally attaches an inline onkeypress handler to this list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onkeypress attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onkeypress attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onkeypress")).toBe(false);
    expect(ul.getAttribute("onkeypress")).toBeNull();
  });
});
