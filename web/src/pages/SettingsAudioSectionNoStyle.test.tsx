import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

/**
 * W2134 — focused coverage that the SettingsPage Audio `<section>` does NOT
 * carry an inline `style` attribute. The Audio section is rendered around
 * line 924 of SettingsPage.tsx and intentionally delegates ALL of its visual
 * presentation to the `.settings-card` CSS class. The element exposes a
 * `data-section-open` toggle attribute, an `aria-labelledby` link to its
 * heading, and a stable `data-testid` — but no inline `style`.
 *
 * Sibling pins on this same Audio `<section>` already cover:
 *   - SettingsAudioSectionNoId.test.tsx — absence of `id` attribute.
 *   - SettingsSectionAudioAriaLabelledBy.test.tsx — aria-labelledby value.
 *   - SettingsSectionAudioOpenAttr.test.tsx — `data-section-open` shape.
 *   - SettingsSectionAudioClassEq.test.tsx — exact `className` equality.
 *
 * None of those guard the ABSENCE of an inline `style` attribute on the
 * outer `<section>`. A future refactor that introduced e.g.
 * `style={{ display: isOpen("audio") ? "block" : "none" }}` to control
 * collapse/expand visibility, or `style={{ "--accent": ... } as ...}` to
 * inject a per-section accent color, would silently:
 *   1. Bypass the established `.settings-card` stylesheet contract, making
 *      theme/dark-mode overrides in CSS hard to apply without `!important`.
 *   2. Couple the section's render output to per-render JS measurement,
 *      reintroducing patterns this page deliberately avoids by using
 *      `data-section-open` + CSS attribute selectors instead.
 *   3. Defeat CSP `style-src` policies that disallow inline styles, which
 *      this app's deployment is free to adopt today precisely because the
 *      Audio section carries no inline style.
 *
 * One focused assertion: the Audio `<section>` MUST NOT carry a `style`
 * attribute. If a future change deliberately needs inline style, it should
 * add the new attribute AND update this pin in the same commit, making the
 * trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not SettingsPage.test.tsx) following the
 * established W2045 / W909 / W18xx pattern so the test shares the
 * `src/pages/Settings` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("SettingsPage — Audio section has no inline style attribute (W2134)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the Audio <section> does NOT carry a style attribute", () => {
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

    // The actual contract: no `style` attribute on the Audio section.
    // Use `hasAttribute` rather than inspecting `.style.cssText` — an
    // empty `style=""` would still be a (broken) public surface that
    // future code or CSP-violation reporters could come to depend on,
    // and DOM `.style` reflection would silently mask its presence.
    expect(audioSection.hasAttribute("style")).toBe(false);
  });
});
