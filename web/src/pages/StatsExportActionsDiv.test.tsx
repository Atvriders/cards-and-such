import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1413: StatsPage's `.stats-export-actions` cluster — the inline button row
 * that groups the three export buttons (Export all / Download stats / CSV)
 * inside `.stats-page-head` — is implemented as a plain `<div>`, not a
 * semantic landmark (`<nav>`, `<menu>`, `<section>`) or a list (`<ul>`).
 * W931 already pins that the cluster lives next to the h1 and contains all
 * three export buttons, and W1269 pins the parent `.stats-page-head` as a
 * DIV, but no existing test pins the element TYPE of the actions wrapper
 * itself. A refactor that promotes it to a `<nav>` would suddenly expose a
 * "navigation" landmark to assistive tech for what is really a destructive-
 * adjacent export-tools strip; promoting it to `<menu>` or `<ul>` would
 * change list semantics. Lock the current `<div>` implementation so any
 * such tag swap is a deliberate, reviewed decision.
 */
describe("StatsPage stats-export-actions — wrapper element type", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1413: stats-export-actions wrapper is a DIV element (no implicit landmark/list role)", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    // Anchor via the export-all button so we don't depend on a testid the
    // wrapper itself doesn't have.
    const exportAll = screen.getByTestId("stats-export-all");
    const actions = exportAll.parentElement;
    expect(actions).not.toBeNull();
    expect(actions?.classList.contains("stats-export-actions")).toBe(true);

    // Pin the element type so a swap to <nav>/<menu>/<ul>/<section> is caught.
    expect(actions?.tagName).toBe("DIV");
  });
});
