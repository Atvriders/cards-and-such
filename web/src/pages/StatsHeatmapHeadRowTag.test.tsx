import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1969 — Sibling-test partner to W1198 (head row aria-hidden + Mon..Sun
 * day labels) and W1341 (head row leading category-column spacer). The
 * `.stats-heatmap-row--head` element is the day-of-week header row of the
 * category × dow heatmap. It is rendered as a `<div>` (not a `<tr>`,
 * `<thead>`, or `<header>`) because the surrounding heatmap is a CSS
 * grid of `<div>` rows rather than a semantic `<table>`, and because the
 * row carries `aria-hidden="true"` (W1198) — making it a purely
 * decorative layout container. A refactor that swapped the head row's
 * tag (e.g. promoting it to `<header>` for "semantics", or downgrading
 * the wrapping grid to a `<table>` and rewriting this row as `<tr>`)
 * would shift its element interface (HTMLDivElement vs.
 * HTMLTableRowElement / HTMLElement) and silently break consumers that
 * rely on the div-grid layout contract pinned by sibling tests.
 *
 * No existing test pins `tagName` on this element directly — W1198 only
 * pins aria-hidden and the day-label set, and W1341 only pins the
 * leading spacer's tag. Pin the head row's own `tagName` so any tag
 * swap fails loudly here.
 */

function renderPage(): void {
  render(
    <MemoryRouter>
      <ConfirmProvider>
        <StatsPage />
      </ConfirmProvider>
    </MemoryRouter>,
  );
}

describe("StatsPage heatmap head row tagName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1969: stats-cat-heatmap head row (.stats-heatmap-row--head) is a DIV element", () => {
    renderPage();
    const grid = screen.getByTestId("stats-cat-heatmap");
    const headRow = grid.querySelector(".stats-heatmap-row--head");
    expect(headRow).not.toBeNull();
    expect((headRow as HTMLElement).tagName).toBe("DIV");
  });
});
