import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2844 — The category x day-of-week heatmap chart root, identified by
 * `data-testid="stats-cat-heatmap"`, is a non-editable visualization
 * container. The HTML `autocapitalize` attribute only has a meaningful
 * effect on editable hosts (`contenteditable` elements, `<input>`,
 * `<textarea>`, `<form>`); applying it to a passive grid is at best
 * inert and at worst signals to assistive tooling and future maintainers
 * that the element accepts typed input. Pin the absence of the
 * `autocapitalize` attribute on the heatmap root so a refactor that
 * sprays global text-entry attributes onto chart containers fails here
 * before it ships.
 */
describe("StatsPage cat heatmap autocapitalize absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2844: stats-cat-heatmap root has no autocapitalize attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("autocapitalize")).toBe(false);
  });
});
