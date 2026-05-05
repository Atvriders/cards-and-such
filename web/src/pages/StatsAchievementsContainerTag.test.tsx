import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1890 — Sibling-test partner to W1850 (stats-activity card tagName=DIV).
 * The achievements card on the StatsPage contains the `.achievements-grid`
 * list/grid container, which is the actual element that lays out the
 * achievement-card children. Existing tests query the grid via
 * `getByTestId("stats-achievements").querySelector(".achievements-grid")`
 * to count locked/unlocked cards (StatsPage.test.tsx lines 284-286,
 * 317-319, 1352-1353, 1699-1700) and W1471/W1476 pin the heading's
 * relationship to the parent stats-card, but NOTHING pins the
 * `.achievements-grid` element's own tagName. A refactor that swapped
 * the grid container from `<div>` to `<ul>`, `<ol>`, `<section>`, or
 * `<nav>` would silently change the page's implicit landmark/role
 * topology — `<ul>`/`<ol>` would expose the achievement cards as a
 * `list` with implicit `listitem` semantics for direct DIV children
 * (changing screen-reader announcements), `<section>` would create
 * an implicit ARIA region landmark, `<nav>` would mis-classify the
 * achievement display as navigation. The CSS grid layout
 * (`.achievements-grid` selector) and the existing `querySelector`
 * traversals do not depend on the tagName, so a tag swap would pass
 * every current assertion while breaking the page's semantic
 * structure. Pin the tagName so a tag swap fails loudly.
 */
describe("StatsPage achievements-grid container tagName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1890: .achievements-grid container is a DIV (not ul/ol/section/nav)", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen
      .getByTestId("stats-achievements")
      .querySelector(".achievements-grid") as HTMLElement | null;
    expect(grid).not.toBeNull();
    expect(grid!.tagName).toBe("DIV");
  });
});
