import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1535: StatsPage's per-chart "Download activity chart as SVG" export
 * control (the `stats-export-line` button on the Activity card) is
 * rendered with an explicit `type="button"` attribute. The button is not
 * currently inside a <form>, but JSX <button> elements default to
 * `type="submit"` semantics if the page is ever wrapped in a form —
 * silently turning this export-trigger into an unwanted form submitter
 * that fires on Enter keypresses anywhere on the page. The author
 * defensively pinned `type="button"` in StatsPage.tsx for exactly this
 * reason. Existing tests cover the export-line button's title (W1396-ish),
 * aria-label (W1136), click-to-download SVG behaviour (W1164), and the
 * inner SVG `focusable="false"` attribute — but no test pins the
 * `type="button"` attribute itself. Lock it here so a regression that
 * drops the explicit type (or flips it to `submit`) is caught. Mirrors
 * W1513 (stats-export-json) and W1524 (stats-export-csv).
 */
describe("StatsPage activity card — export-line button type attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1535: stats-export-line button carries explicit type=\"button\" to prevent form-submit semantics", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("stats-export-line");
    // Pin the attribute exactly so a regression that drops or flips it
    // (e.g. to `submit`) is caught.
    expect(btn.getAttribute("type")).toBe("button");
  });
});
