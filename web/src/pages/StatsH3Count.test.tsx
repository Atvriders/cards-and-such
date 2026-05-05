import { beforeEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1921: StatsPage uses a strict heading hierarchy: a single page-level <h1>
 * and one <h2> per section card. The page intentionally does NOT introduce any
 * <h3> sub-headings — section subtitles are rendered as <p> framing copy, and
 * row labels / record values are inline elements (<span>, <em>, <strong>).
 *
 * The companion StatsH2Count test pins the count of <h2> elements, but nothing
 * currently asserts that <h3> stays at zero. A future refactor that demotes an
 * <h2> to <h3>, or introduces an <h3> sub-heading inside a card (e.g. for a
 * collapsible drilldown title), would silently break the heading-level outline
 * for screen readers without tripping any existing test. Pin the structural
 * count of <h3> elements at 0 so any such regression surfaces immediately.
 */
describe("StatsPage — total <h3> count (structural pin)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1921: renders exactly 0 <h3> elements in default empty state", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    expect(document.querySelectorAll("h3").length).toBe(0);
  });
});
