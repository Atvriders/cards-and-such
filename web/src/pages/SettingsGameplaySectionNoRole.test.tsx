import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

/**
 * W2397 — focused coverage that the SettingsPage Gameplay `<section>` does
 * NOT carry an explicit `role` attribute. The Gameplay section is rendered
 * around line 1080 of SettingsPage.tsx using the native `<section>` element
 * with an `aria-labelledby` link to its heading
 * ("settings-gameplay-heading"); this gives it the implicit ARIA role of
 * `region`, which is the desired accessibility shape. Adding an explicit
 * `role` attribute (e.g. `role="region"` redundantly, or worse,
 * `role="group"` / `role="form"` / `role="presentation"`) would either be
 * redundant noise that contributes nothing semantically, or would actively
 * distort the landmark structure that screen readers expose for the
 * Settings page.
 *
 * Sibling pins on this same Gameplay `<section>` already cover:
 *   - SettingsGameplaySectionNoId.test.tsx — absence of `id` attribute (W2053).
 *   - SettingsGameplaySectionNoStyle.test.tsx — absence of inline `style` (W2136).
 *   - SettingsSectionGameplayAriaLabelledBy.test.tsx — aria-labelledby value.
 *   - SettingsSectionGameplayOpenAttr.test.tsx — `data-section-open` shape.
 *   - SettingsSectionGameplayClassEq.test.tsx — exact `className` equality.
 *
 * None of those guard the ABSENCE of an explicit `role` attribute on the
 * outer `<section>`. A regression that bolted `role="..."` on the section
 * would silently change the landmark semantics for assistive technology
 * without tripping any existing assertion. Mirrors W2362 (Audio).
 *
 * Lives in a NEW SIBLING file (not SettingsPage.test.tsx) following the
 * established W2362 / W2053 / W2136 pattern so the test shares the
 * `src/pages/Settings` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("SettingsPage — Gameplay section has no explicit role attribute (W2397)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the Gameplay <section> does NOT carry a `role` attribute", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );

    const gameplaySection = screen.getByTestId("settings-section-gameplay");

    // Sanity: confirm we pinned the outer <section> and not, say, an inner
    // settings-field row. Without this guard a future restructure that
    // moved the data-testid onto a child div could pass vacuously.
    expect(gameplaySection.tagName).toBe("SECTION");

    // The actual contract: no explicit `role` attribute on the Gameplay
    // section. The native <section> with aria-labelledby supplies the
    // implicit `region` landmark; an explicit role would be redundant or
    // distorting.
    expect(gameplaySection.hasAttribute("role")).toBe(false);
  });
});
