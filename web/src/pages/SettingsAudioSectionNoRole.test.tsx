import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

/**
 * W2362 — focused coverage that the SettingsPage Audio `<section>` does NOT
 * carry an explicit `role` attribute. The Audio section is rendered around
 * line 924 of SettingsPage.tsx using the native `<section>` element with an
 * `aria-labelledby` link to its heading; this gives it the implicit ARIA role
 * of `region`, which is the desired accessibility shape. Adding an explicit
 * `role` attribute (e.g. `role="region"` redundantly, or worse, `role="group"`
 * / `role="form"` / `role="presentation"`) would either be redundant noise
 * that contributes nothing semantically, or would actively distort the
 * landmark structure that screen readers expose for the Settings page.
 *
 * Sibling pins on this same Audio `<section>` already cover:
 *   - SettingsAudioSectionNoId.test.tsx — absence of `id` attribute (W2045).
 *   - SettingsAudioSectionNoStyle.test.tsx — absence of inline `style` (W2134).
 *   - SettingsSectionAudioAriaLabelledBy.test.tsx — aria-labelledby value.
 *   - SettingsSectionAudioOpenAttr.test.tsx — `data-section-open` shape.
 *   - SettingsSectionAudioClassEq.test.tsx — exact `className` equality.
 *
 * None of those guard the ABSENCE of an explicit `role` attribute on the
 * outer `<section>`. A regression that bolted `role="..."` on the section
 * would silently change the landmark semantics for assistive technology
 * without tripping any existing assertion.
 *
 * Lives in a NEW SIBLING file (not SettingsPage.test.tsx) following the
 * established W2045 / W909 / W18xx pattern so the test shares the
 * `src/pages/Settings` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("SettingsPage — Audio section has no explicit role attribute (W2362)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the Audio <section> does NOT carry a `role` attribute", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );

    const audioSection = screen.getByTestId("settings-section-audio");

    // Sanity: confirm we pinned the outer <section> and not, say, an inner
    // settings-field row. Without this guard a future restructure that
    // moved the data-testid onto a child div could pass vacuously.
    expect(audioSection.tagName).toBe("SECTION");

    // The actual contract: no explicit `role` attribute on the Audio section.
    // The native <section> with aria-labelledby supplies the implicit
    // `region` landmark; an explicit role would be redundant or distorting.
    expect(audioSection.hasAttribute("role")).toBe(false);
  });
});
