import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2961: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `charset` attribute is
 * only defined on <meta> and (legacy/deprecated) <script> elements, where it
 * declares the character encoding of the document or external script. On a
 * <ul> the attribute carries no defined semantics, but leaving it present
 * would still be exposed via DOM serialization and could confuse encoding
 * sniffers, crawlers, or future refactors that try to interpret it as an
 * encoding hint. Sibling tests already pin the absence of `id`, `role`,
 * `style`, `tabindex`, `is`, `cite`, and a broad array of ARIA / global
 * attributes on this <ul>, but none pin the absence of `charset`. Pinning it
 * here ensures any future change that accidentally attaches a `charset` value
 * to this presentational summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — charset attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2961: stats-prev-week ul has no charset attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("charset")).toBe(false);
    expect(ul.getAttribute("charset")).toBeNull();
  });
});
