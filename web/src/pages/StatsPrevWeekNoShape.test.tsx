import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2897: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `shape` attribute is a
 * legacy/obsolete attribute historically valid only on <a> and <area>
 * elements (used to define the clickable region of an image map: rect /
 * circle / poly / default). It has no defined meaning on a <ul> and is not
 * part of the WHATWG HTML living standard for list elements. Attaching a
 * `shape` attribute to this <ul> would emit an invalid, non-standard
 * attribute, potentially trigger React DOM warnings, and create a
 * misleading hint to readers/tools that this list participates in image-map
 * semantics. Sibling tests pin the absence of `is`, `id`, `role`, `style`,
 * `tabindex`, and a wide array of ARIA / global / link-only attributes on
 * this <ul>, but no existing test pins the absence of `shape`. Pinning it
 * here ensures any future refactor that tries to leak an image-map
 * attribute onto this presentational list is reviewed deliberately rather
 * than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — shape attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2897: stats-prev-week ul has no shape attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("shape")).toBe(false);
    expect(ul.getAttribute("shape")).toBeNull();
  });
});
