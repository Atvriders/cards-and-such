import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1750 — Sibling-test partner to W1210 (5 data rows + ordered category
 * labels), W1364 (data-row label SPAN tag), W1369 (label firstElementChild
 * position), W1440 (label leaf shape), and W1576 (data row 1+7 child count).
 * Each data-row category label in the heatmap is rendered as
 * `<span className="stats-heatmap-cat">{cat}</span>` — a *plain* text-only
 * label with NO `title` attribute. The sibling `.stats-heatmap-cell` boxes
 * (W1422 etc.) DO carry a `title={`${cat} · ${d}: ${v}`}` tooltip, so a
 * well-meaning refactor that copy-pasted the cell pattern onto the row
 * label (e.g. `title={cat}` for "tooltip parity") would silently inject a
 * native browser tooltip on hover that duplicates the visible text below
 * (a screen-reader echo + redundant pointer affordance for keyboard users).
 * W1364/W1440 only pin the tag and child count; W1210 only pins the text;
 * none assert that the label has no `title`. Pin the absence here on every
 * data-row label so any such tooltip leak fails loudly at the row that was
 * changed.
 */
describe("StatsPage heatmap data-row category label has no title attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1750: stats-heatmap-cat data-row label has no `title` attribute on every data row", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    // Exclude the decorative head row (W1341 owns its empty leading spacer)
    // so we only inspect the labels on the 5 data rows.
    const dataRows = Array.from(
      grid.querySelectorAll(".stats-heatmap-row"),
    ).filter((r) => !r.classList.contains("stats-heatmap-row--head"));
    expect(dataRows.length).toBe(5);

    for (const row of dataRows) {
      const label = row.querySelector(".stats-heatmap-cat") as HTMLElement | null;
      expect(label).not.toBeNull();
      // Lock the absence of any `title`: a copy-paste from `.stats-heatmap-cell`
      // (which DOES carry `title="${cat} · ${d}: ${v}"`) onto the label would
      // surface the native browser tooltip on hover — fail loudly here so the
      // regression is caught at the offending row.
      expect(label!.hasAttribute("title")).toBe(false);
      // Belt-and-suspenders: getAttribute returns null (not "" — an empty
      // string would still set the attribute and is its own regression).
      expect(label!.getAttribute("title")).toBeNull();
    }
  });
});
