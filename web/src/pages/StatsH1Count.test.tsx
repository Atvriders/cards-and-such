import { beforeEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2010: StatsPage renders exactly ONE page-level `<h1>` — the literal
 * `<h1>Your stats</h1>` heading inside the `stats-page-head` wrapper. By
 * accessibility convention each route should have exactly one h1, and the
 * existing StatsH1* coverage (W823 role-based, W1390 ordering, W1570
 * className, W1580 id, W1893 textContent, W1899 tagName) all locate
 * "the" h1 via `getByRole("heading", { level: 1 })` or
 * `querySelector("h1")` (singular). None of those assert the *total
 * number* of h1 elements on the page.
 *
 * A future refactor that accidentally adds a second h1 — e.g. a hidden
 * screen-reader-only heading inside a section card, or an h1 inside a
 * lazy-loaded modal — would slip past every existing selector because
 * each one returns the *first* match and ignores duplicates. The role-
 * based selectors would even start throwing in strict mode if multiple
 * matched, but the bare `querySelector("h1")` calls would silently
 * continue passing while the document quietly gained extra h1s.
 *
 * Pin the structural count of `<h1>` elements directly via
 * `document.querySelectorAll("h1").length === 1` so any extra h1
 * (or the heading's removal) surfaces as a test failure.
 */
describe("StatsPage — total <h1> count (structural pin)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2010: renders exactly 1 <h1> element (the page-level title)", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    expect(document.querySelectorAll("h1").length).toBe(1);
  });
});
