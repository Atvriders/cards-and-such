import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1761 — Sibling-test partner to W1192 (cell title with non-zero count),
 * W1206 (cell className), W1210 (cell data-count), W1403 (cell visible
 * numeric text), and W1422 (cell SPAN tag). The category × day-of-week
 * heatmap renders a `title={`${cat} · ${d}: ${v}`}` tooltip on EVERY
 * cell — including zero-count cells whose visible text is empty (W1403
 * pins that empty cells render no text). The tooltip is the only
 * affordance that surfaces "(category, day) had 0 plays" on hover; if
 * the title were conditionally suppressed for v=0 (e.g.,
 * `title={v > 0 ? \`${cat} · ${d}: ${v}\` : undefined}`) or stripped of
 * the count when zero (e.g., `title={\`${cat} · ${d}\`}`) every existing
 * heatmap test would still pass: W1192 only seeds a non-zero cell, W1210
 * pins data-count="0" but not title, and W1403 only pins textContent.
 *
 * Pin the title format on a zero-count cell here. With a fresh localStorage
 * (no plays seeded), every cell has v=0 and must carry the exact tooltip
 * `${cat} · ${d}: 0` — middle-dot separator (U+00B7), space-padded, with
 * the literal `: 0` suffix.
 */
describe("StatsPage heatmap cell title format on zero-count cells", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1761: stats-heatmap-cell carries title='<cat> · <Day>: 0' on empty cells", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    // Sample a known-empty cell: with localStorage cleared above, every
    // cell in the 5×7 grid has v=0. Pick (board, mon) — the same coordinate
    // the in-file W1210 test uses for its empty-cell anchor — so a
    // regression here can be triaged against that sibling test.
    const cell = screen.getByTestId("stats-cat-heatmap-board-mon");

    // Belt-and-braces: confirm the cell is in fact empty before asserting
    // the title. If data-count drifts, fix W1210 before debugging this test.
    expect(cell.getAttribute("data-count")).toBe("0");
    expect(cell.textContent).toBe("");

    // Exact tooltip format on a zero-count cell. The middle-dot character
    // (U+00B7) is pinned by codepoint so font/encoding regressions surface,
    // and the literal `: 0` suffix is pinned so a refactor that drops the
    // count for zero values (or replaces it with a localized string like
    // "no plays") fails here.
    expect(cell.getAttribute("title")).toBe("board · Mon: 0");
    expect(cell.getAttribute("title")).toContain(" · ");
    expect(cell.getAttribute("title")?.endsWith(": 0")).toBe(true);
  });
});
