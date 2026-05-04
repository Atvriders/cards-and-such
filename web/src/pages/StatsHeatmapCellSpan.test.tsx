import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1422 — Sibling-test partner to W1192 (cell className), W1206 (cell title),
 * W1210 (cell data-count), W1403 (cell visible numeric text), and W1364
 * (data-row category label SPAN tag). Each heatmap data cell is rendered
 * as a `<span>` element — not a `<div>`, `<td>`, or `<button>`. The tag
 * choice matters: spans flow inline inside the `.stats-heatmap-row`
 * container's CSS grid without the block-level box semantics a `<div>`
 * would introduce, and avoids the implicit semantics of `<td>` (which
 * would require a `<table>` ancestor) or `<button>` (which would expose
 * 35 spurious focus stops to keyboard users). A refactor that swapped
 * the cell tag to one of those would still leave className, data-count,
 * title, opacity, data-testid, and text content intact while breaking
 * the grid layout and a11y contract. Pin the SPAN tag here.
 */
describe("StatsPage heatmap cell span tag", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1422: stats-heatmap-cell renders as a SPAN element (not div/td/button)", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    // Pick any data cell — we use the first one resolvable by data-testid
    // (solitaire × monday). The tag-name contract is uniform across all
    // 35 cells, so a single sample is sufficient.
    const cell = screen.getByTestId("stats-cat-heatmap-solitaire-mon");
    expect(cell.tagName).toBe("SPAN");
    // Sanity: must also carry the cell className so we know we resolved
    // the data cell and not some unrelated sibling. If this fails first,
    // the data-testid contract changed — debug W1210 before this one.
    expect(cell.classList.contains("stats-heatmap-cell")).toBe(true);
  });
});
