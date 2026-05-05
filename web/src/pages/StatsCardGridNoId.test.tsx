import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1998: StatsPage's responsive `.stats-card-grid` <section> wrapper currently
 * has NO `id` attribute. Sibling tests pin its tagName=SECTION (W1235), exact
 * className (W1918), and the absence of aria-label/aria-labelledby (W1930) —
 * but no test pins the absence of an `id`. Adding an `id` to the section
 * would create a stable in-page anchor (e.g. for fragment links, ScrollSpy
 * targets, or label-for relationships) and could be silently relied upon by
 * downstream code, making removal a hidden breaking change. The current
 * design instead keeps the wrapper styled purely via class hooks, so its
 * structure can be freely refactored.
 *
 * Pin the ABSENCE of an `id` attribute on the `.stats-card-grid` <section>
 * so that any future refactor which decorates the section with an `id` is
 * caught and reviewed deliberately.
 */
describe("StatsPage stats-card-grid — section id attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1998: .stats-card-grid <section> has no id attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const activity = screen.getByTestId("stats-activity");
    const grid = activity.parentElement;
    expect(grid).not.toBeNull();
    expect(grid!.tagName).toBe("SECTION");
    expect(grid!.classList.contains("stats-card-grid")).toBe(true);

    // Pin the absence of an `id` on the section. A future change adding an
    // `id` would create a hidden in-page anchor / DOM-query handle that
    // downstream code could silently depend on, and must be reviewed
    // deliberately.
    expect(grid!.hasAttribute("id")).toBe(false);
  });
});
