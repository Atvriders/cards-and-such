import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2861: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". It is a presentational list of
 * read-only summary rows (Prior plays / Prior wins / Prior avg time) and
 * is not a customized built-in element. The HTML `is` attribute is reserved
 * for upgrading a built-in element to a customized built-in custom element
 * (e.g. `<ul is="my-list">`), which would route construction through a
 * `customElements.define(..., { extends: "ul" })` registration. Attaching
 * an `is` attribute to this <ul> would silently change its element class
 * and lifecycle, opt it into custom-element upgrade semantics, and bypass
 * the React-managed contract this list relies on. Sibling tests already
 * pin the absence of `id`, `role`, `style`, `tabindex`, and a wide array
 * of ARIA / global attributes on this <ul>, but no existing test pins the
 * absence of `is`. Pinning it here ensures any future refactor that tries
 * to convert this presentational list into a customized built-in element
 * is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — is attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2861: stats-prev-week ul has no is attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("is")).toBe(false);
    expect(ul.getAttribute("is")).toBeNull();
  });
});
