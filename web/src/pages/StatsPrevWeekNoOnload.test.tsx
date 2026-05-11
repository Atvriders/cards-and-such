import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3122: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `onload` attribute is an
 * event handler content attribute meaningful on elements like <body>, <img>,
 * <script>, <iframe>, etc. — never on a <ul>. Allowing an `onload` attribute
 * to slip onto this presentational summary list would either be silently
 * ignored or, worse, become a vector for inline-script execution if the value
 * were ever derived from untrusted input. Sibling tests already pin the
 * absence of `id`, `role`, `style`, `tabindex`, `is`, `cite`, and a broad
 * array of ARIA / global attributes on this <ul>, but none pin the absence
 * of `onload`. Pinning it here ensures any future change that accidentally
 * attaches an `onload` handler to this list is reviewed deliberately rather
 * than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onload attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3122: stats-prev-week ul has no onload attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onload")).toBe(false);
    expect(ul.getAttribute("onload")).toBeNull();
  });
});
