import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1930: StatsPage's responsive `.stats-card-grid` <section> wrapper currently
 * has NO `aria-label` or `aria-labelledby` attribute. Existing tests pin its
 * tagName=SECTION (W1235), exact className (W1918), child .stats-card count
 * (W1902), and child wrap classes — but no test pins the wrapper's aria
 * surface. Adding an `aria-label` to the section would expose it as a named
 * landmark to assistive tech, which is a meaningful accessibility behaviour
 * change (it would create an unnamed-then-named region drift in screen-reader
 * navigation, and possibly conflict with the page's flat semantic structure
 * that intentionally relies on the H2 sibling — see W1480 / W828 / W833).
 *
 * Pin the ABSENCE of both `aria-label` and `aria-labelledby` on the
 * `.stats-card-grid` <section> so that any future refactor which decorates
 * the section with an accessible name is caught and reviewed deliberately.
 */
describe("StatsPage stats-card-grid — section aria-label/aria-labelledby absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1930: .stats-card-grid <section> has no aria-label or aria-labelledby attribute", () => {
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

    // Pin the absence of an accessible name on the section landmark.
    // A future change adding either attribute would change how assistive
    // tech announces this region and must be reviewed deliberately.
    expect(grid!.hasAttribute("aria-label")).toBe(false);
    expect(grid!.hasAttribute("aria-labelledby")).toBe(false);
  });
});
