import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2729: StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list") is rendered as a plain <ul> with
 * className "stats-week-list". It is a presentational list of read-only
 * summary rows (This-week plays / This-week wins / This-week avg time)
 * whose content is in the document's default writing direction. Sibling
 * structural contracts already pin class names, child counts, label/value
 * tags, and the absence of `id`, `role`, inline `style`, `tabindex`, and
 * ARIA attributes on this <ul>, but no existing test pins the absence of
 * the `dir` attribute. Adding `dir="ltr"` or `dir="rtl"` would override
 * the inherited document direction for this subtree, breaking RTL locales
 * (forcing LTR) or accidentally mirroring the row layout (forcing RTL),
 * silently changing visual order. Pinning the absence of `dir` ensures
 * any future refactor that scopes a writing direction here is reviewed
 * deliberately rather than slipping in unnoticed. (The sibling
 * stats-prev-week ul already has the analogous pin under W2727; this
 * completes the parity for the stats-this-week-list ul.)
 */
describe("StatsPage stats-this-week-list ul — dir attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2729: stats-this-week-list ul has no dir attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("dir")).toBe(false);
    expect(ul.getAttribute("dir")).toBeNull();
  });
});
