import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1445 — Sibling-test partner to W1250 (root role+aria-label), W1278
 * (row DIV tag), W1198 (head aria-hidden + Mon..Sun labels), and W1206
 * (cell className). The category × day-of-week heatmap's *outer wrapper*
 * is rendered as `<div className="stats-heatmap" data-testid="stats-cat-heatmap" ...>`.
 * W1250 pins the wrapper's role + aria-label, but no existing test pins
 * its element TYPE or its outer `.stats-heatmap` className. A refactor
 * that swapped the wrapper `<div>` for a `<section>`/`<figure>`/`<table>`
 * — or that renamed the outer hook (e.g. to `stats-cat-heatmap` /
 * `heatmap-grid`) while keeping every inner row/cell class intact — would
 * silently break the CSS-grid layout that the inner cells rely on (see
 * HeatmapChart docstring) and could re-introduce semantic table roles
 * that fight the root `role="img"`. Every existing heatmap assertion
 * scopes via the data-testid and inner className lookups, so the wrapper
 * tag/class swap would slip past untouched. Pin both here so the outer
 * box is locked to a plain `<div>` carrying `.stats-heatmap`.
 */
describe("StatsPage heatmap outer wrapper element type and class", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1445: stats-cat-heatmap outer wrapper is a DIV carrying the .stats-heatmap class", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    // Lock the outer tag so a swap to <section>/<figure>/<table>/<ul>
    // — which would inject competing semantics under role="img" — fails.
    expect(grid.tagName).toBe("DIV");
    // Lock the outer className so a rename (e.g. `.heatmap-grid`,
    // `.stats-heatmap-grid`) that breaks the CSS-grid layout fails too.
    expect(grid.classList.contains("stats-heatmap")).toBe(true);
  });
});
