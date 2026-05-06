import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2899: StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list") is rendered as a plain <ul> inside
 * the stats-this-week card. The HTML `shape` attribute is a legacy/obsolete
 * attribute historically valid only on <a> and <area> elements (used to
 * define the clickable region of an image map: rect / circle / poly /
 * default). It has no defined meaning on a <ul> and is not part of the
 * WHATWG HTML living standard for list elements. Attaching a `shape`
 * attribute to this <ul> would emit an invalid, non-standard attribute,
 * potentially trigger React DOM warnings, and create a misleading hint to
 * readers/tools that this presentational list participates in image-map
 * semantics. Sibling tests pin the absence of `is`, `id`, `role`, `style`,
 * `tabindex`, `coords`, and a wide array of ARIA / global / link-only
 * attributes on this <ul>, and a peer test (W2897) pins shape absence on
 * the prior-week <ul> — but no existing test pins the absence of `shape`
 * on the this-week list. Pinning it here ensures any future refactor that
 * tries to leak an image-map attribute onto this presentational list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — shape attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2899: stats-this-week-list <ul> has no shape attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    expect(list.tagName).toBe("UL");
    // No shape — `shape` is valid only on <a>/<area>, never on <ul>.
    expect(list.hasAttribute("shape")).toBe(false);
    expect(list.getAttribute("shape")).toBeNull();
  });
});
