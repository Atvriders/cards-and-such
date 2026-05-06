import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2822: StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list") is rendered as a plain <ul> with
 * className "stats-week-list". It is a presentational list of read-only
 * summary rows (This-week plays / wins / avg time). Sibling structural
 * contracts already pin class names, child counts, label/value tags, and
 * the absence of `id`, `role`, inline `style`, `tabindex`, `dir`,
 * `spellcheck`, `hidden`, and a wide range of ARIA attributes on this
 * <ul>, but no existing test pins the absence of the global `translate`
 * attribute. The `translate` attribute (`translate="yes"` / `"no"`)
 * controls whether browser/extension translation tooling should localize
 * the subtree. Setting it on the week summary list would either force the
 * numeric values and labels through translation pipelines (potentially
 * mangling locale-sensitive number formatting) or opt the entire subtree
 * out of translation in a way that conflicts with the page's overall
 * localization strategy. Pinning the absence of `translate` ensures any
 * future change that opts this subtree into a specific translation
 * behavior is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — translate attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2822: stats-this-week-list ul has no translate attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("translate")).toBe(false);
    expect(ul.getAttribute("translate")).toBeNull();
  });
});
