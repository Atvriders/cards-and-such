import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1544: StatsPage's "Download time-spent pie chart" export control in
 * the records card is rendered with an explicit `type="button"`
 * attribute. The button is not currently inside a <form>, but JSX
 * <button> elements default to `type="submit"` semantics if the page is
 * ever wrapped in a form — silently turning this export-trigger into an
 * unwanted form submitter that fires on Enter keypresses anywhere on the
 * page. The author defensively pinned `type="button"` in StatsPage.tsx
 * for exactly this reason. Existing tests cover the export-pie button's
 * SVG focusable attribute and title — but no test pins the
 * `type="button"` attribute itself. Lock it here so a regression that
 * drops the explicit type (or flips it to `submit`) is caught. Mirrors
 * W1513/W1524/W1535/W1536 for sibling export buttons.
 */
describe("StatsPage records card — export-pie button type attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1544: stats-export-pie button carries explicit type=\"button\" to prevent form-submit semantics", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("stats-export-pie");
    // Pin the attribute exactly so a regression that drops or flips it
    // (e.g. to `submit`) is caught.
    expect(btn.getAttribute("type")).toBe("button");
  });
});
