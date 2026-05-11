import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `onloadedmetadata`
 * attribute is a media-event handler defined only on <audio> and <video>
 * elements, where it fires once metadata (duration, dimensions, tracks) is
 * available. On a <ul> the attribute carries no defined semantics and would
 * never be invoked by any user agent, but leaving it present would still be
 * exposed via DOM serialization and could mislead future refactors that try
 * to interpret it as an event hook. Sibling tests already pin the absence of
 * `id`, `role`, `style`, `tabindex`, `is`, `cite`, and a broad array of ARIA
 * / global attributes on this <ul>, but none pin the absence of
 * `onloadedmetadata`. Pinning it here ensures any future change that
 * accidentally attaches an `onloadedmetadata` handler to this presentational
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onloadedmetadata attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onloadedmetadata attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onloadedmetadata")).toBe(false);
    expect(ul.getAttribute("onloadedmetadata")).toBeNull();
  });
});
