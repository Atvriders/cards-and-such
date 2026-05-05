import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SettingsPage from "./SettingsPage.js";

/**
 * W2096 — pin a structural FLOOR on the SettingsPage's overall
 * `<button>` tag count.
 *
 * SettingsPage emits `<button>` elements from many independent
 * surfaces — section toggles (Appearance / Audio / Gameplay / Data),
 * theme switcher entries, animation radiogroup options, data
 * import / export / clear controls, the analytics refresh / clear
 * controls, the analytics-toggle, etc. Existing sibling tests
 * pin many of these in isolation by `data-testid` (e.g.
 * SettingsExportButtonClass, SettingsImportButtonClass,
 * SettingsResetButtonClass, SettingsAnalyticsRefreshType,
 * SettingsAnalyticsClearType, SettingsDataClearDanger,
 * SettingsAnalyticsToggleType, SettingsHeaderSearchType,
 * SettingsThemeSwitcherTag, SettingsSectionToggle*AriaControls,
 * …) but NO existing test asserts the AGGREGATE `<button>`
 * cardinality of the page, so a regression that drops a whole
 * family of button surfaces (e.g. collapses all the section
 * toggles into `<a>`s, replaces the data-action buttons with
 * links) would silently slip past every per-feature pin.
 *
 * This pin uses a CONSERVATIVE FLOOR (>=5), well below the
 * observed count on master, so it only trips when an entire
 * button-emitting surface category is removed.
 *
 * The selector is tag-only — `querySelectorAll("button")` —
 * deliberately orthogonal to every existing data-testid based
 * pin. The contract under test is the literal `<button>` tag
 * emission, not any particular id stamping.
 */
describe("SettingsPage — overall <button> count floor (W2096)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders at least 5 <button> elements on a fresh mount", () => {
    render(
      <MemoryRouter initialEntries={["/settings"]}>
        <SettingsPage />
      </MemoryRouter>,
    );

    const buttons = document.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThanOrEqual(5);
  });
});
