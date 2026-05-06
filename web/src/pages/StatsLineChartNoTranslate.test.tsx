import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2841 — the StatsPage activity LineChart `<svg>` (resolved via the
 * stable `data-testid="stats-line-chart"` hook) MUST NOT carry the
 * global HTML `translate` attribute. The element is rendered by the
 * `LineChart` component at StatsPage.tsx and intentionally only
 * declares `viewBox`, `className="stats-svg"`, `role`, `aria-label`,
 * and the `data-testid` — translation behaviour for chart subtrees is
 * inherited from the surrounding document, NOT pinned per-SVG.
 *
 * The `translate` attribute (`translate="yes"` / `"no"`) controls
 * whether browser auto-translate tooling (Chrome, Edge, third-party
 * extensions) and machine-translation pipelines treat the element's
 * text content as translatable. The chart SVG contains no localized
 * user-facing text content of its own — labels and axis values are
 * either purely numeric or generated programmatically — so there is
 * nothing to translate. Pinning either value would be wrong:
 *
 *   - `translate="no"` would be a noisy noop on a subtree that has
 *     no translatable text, AND it would shadow any future i18n
 *     decision the document `<html>` element makes.
 *   - `translate="yes"` would invite extension-driven mutation of an
 *     SVG subtree whose text nodes (when present) are
 *     numeric/programmatic and not safe for natural-language
 *     substitution — Chrome auto-translate has been observed to
 *     rewrite numeric tick labels into other locales' separators,
 *     breaking the chart's visual contract.
 *
 * Sibling pins on this same `<svg data-testid="stats-line-chart">`
 * already cover other absent global attributes:
 *   - W2696 (StatsLineChartNoLang.test.tsx) pins absence of `lang`.
 *   - W2068 (StatsLineChartNoId.test.tsx) pins absence of `id`.
 *   - W2117 (StatsLineChartNoStyle.test.tsx) pins absence of inline
 *     `style`.
 *   - StatsLineChartNoSpellcheck / NoDir / NoHidden / NoTabindex /
 *     NoAriaBusy / NoAriaControls / NoAriaDescribedBy /
 *     NoAriaDisabled / NoAriaHidden / NoAriaRoleDescription pin the
 *     absence of their respective attributes.
 *
 * What none of those cover is the ABSENCE of the `translate`
 * attribute on the chart SVG itself. Pinning it here matches the
 * sibling W2812 (StatsCatHeatmapNoTranslate), W2820
 * (StatsPrevWeekNoTranslate), and W2822 (StatsThisWeekListNoTranslate)
 * contracts that already lock down translate-absence on adjacent
 * StatsPage surfaces, completing the page-wide invariant that no
 * Stats chart/list root ships an explicit `translate` attribute.
 *
 * One focused assertion: the chart SVG MUST NOT carry a `translate`
 * attribute. If a future change deliberately needs one, it should add
 * the new `translate` AND update this pin in the same commit, making
 * the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not StatsPage.test.tsx) following the
 * established W2117 / W2068 / W2696 sibling-file pattern so the test
 * shares the `src/pages/Stats` vitest path filter without colliding
 * with concurrent edits to the mega-file.
 */
describe("StatsPage — line-chart SVG has no translate attribute (W2841)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the stats-line-chart <svg> does NOT carry a translate attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const chart = screen.getByTestId("stats-line-chart");

    // Sanity: confirm we resolved the chart SVG itself, not some
    // wrapper, so the assertion below cannot pass vacuously after a
    // future restructure that moved the data-testid onto a parent.
    expect(chart.tagName).toBe("svg");
    expect(chart.getAttribute("role")).toBe("img");

    // The actual contract: no `translate` attribute on the chart SVG.
    // Use `hasAttribute` rather than checking `.translate` — an empty
    // `translate=""` would still be a public surface that opts the
    // subtree into browser auto-translate handling and fragments the
    // page-wide translate-absence invariant pinned by the sibling
    // W2812 / W2820 / W2822 contracts.
    expect(chart.hasAttribute("translate")).toBe(false);
    expect(chart.getAttribute("translate")).toBeNull();
  });
});
