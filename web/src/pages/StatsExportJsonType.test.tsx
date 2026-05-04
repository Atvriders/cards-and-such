import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1513: StatsPage's "Download stats" JSON export control in the page-head
 * export actions row is rendered with an explicit `type="button"`
 * attribute. The button is not currently inside a <form>, but JSX
 * <button> elements default to `type="submit"` semantics if the page is
 * ever wrapped in a form — silently turning this export-trigger into an
 * unwanted form submitter that fires on Enter keypresses anywhere on the
 * page. The author defensively pinned `type="button"` in StatsPage.tsx
 * for exactly this reason. Existing tests cover the export-json button's
 * className, data-testid, title attribute (W1396), click-to-download
 * behaviour (W655), and the inner JSON badge glyph (W1134) — but no test
 * pins the `type="button"` attribute itself. Lock it here so a regression
 * that drops the explicit type (or flips it to `submit`) is caught.
 */
describe("StatsPage page-head — export-json button type attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1513: stats-export-json button carries explicit type=\"button\" to prevent form-submit semantics", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("stats-export-json");
    // Pin the attribute exactly so a regression that drops or flips it
    // (e.g. to `submit`) is caught.
    expect(btn.getAttribute("type")).toBe("button");
  });
});
