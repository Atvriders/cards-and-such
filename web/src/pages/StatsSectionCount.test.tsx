import { beforeEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1945: StatsPage uses a single semantic <section> element — the
 * `stats-card-grid` wrapper — that visually and structurally groups every
 * stats panel (activity, records, categories, hour-of-day, heatmap, this
 * week, personal records, PR-by-category, most-hinted, replays,
 * achievements). The page header (h1, controls, export actions) lives
 * outside this section, and the footer (note + reset button) is rendered
 * after it.
 *
 * Many existing tests pin individual section-related semantics: each of
 * the StatsSectionH2*Parent tests asserts that a particular h2 lives
 * inside an element matching certain semantics, and StatsCardsCount pins
 * the *div* panel count inside the grid. However, no existing test pins
 * the bare *count* of `<section>` elements rendered by the page. A
 * regression that splits the grid into multiple sections, wraps the page
 * head in an additional `<section>`, or downgrades the wrapper to a
 * `<div>` would silently change the document outline — affecting screen
 * reader landmark navigation and the ARIA region structure — while every
 * per-panel test continues to pass.
 */
describe("StatsPage — top-level <section> element count", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1945: renders exactly 1 <section> element in the default empty state", () => {
    const { container } = render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const sections = container.querySelectorAll("section");
    // Pin the document outline: the stats-card-grid section is the
    // single semantic section on the page.
    expect(sections.length === 1).toBe(true);
  });
});
