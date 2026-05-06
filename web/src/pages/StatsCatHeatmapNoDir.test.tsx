import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2717 — The category × day-of-week heatmap chart root, identified by
 * `data-testid="stats-cat-heatmap"`, intentionally omits a `dir` attribute
 * so that text directionality is inherited from the document / host
 * application shell. The heatmap renders numeric play counts plus short
 * category labels (potentially user-supplied in any script, including RTL
 * scripts like Arabic or Hebrew) and weekday abbreviations. Pinning a `dir`
 * attribute onto the chart root would (a) override the user-agent or
 * document-level direction for screen readers and bidi algorithms walking
 * up the dir inheritance chain, (b) hard-code an LTR/RTL assumption that
 * would mis-render category names in the opposite script, and (c) duplicate
 * state that the surrounding shell already owns. Pin the absence of `dir`
 * on the heatmap root so a future refactor that hardcodes an inline
 * direction (e.g. `dir="ltr"`) fails here before it ships and quietly
 * breaks bidi rendering for RTL category labels.
 */
describe("StatsPage cat heatmap dir absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2717: stats-cat-heatmap root has no dir attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("dir")).toBe(false);
  });
});
