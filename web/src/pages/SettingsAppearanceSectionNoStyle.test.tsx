import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

/**
 * W2135 — focused coverage of the Appearance <section>'s lack of an inline
 * `style` attribute. The section is rendered around line 663 of
 * SettingsPage.tsx and identified by `data-testid="settings-section-appearance"`.
 * Its visual presentation is owned entirely by the `.settings-card` CSS class,
 * not by any inline style prop.
 *
 * Sibling pins on this same Appearance <section>:
 *   - SettingsSectionAppearanceClassEq.test.tsx pins exact className.
 *   - SettingsSectionAppearanceAriaLabelledBy.test.tsx pins aria-labelledby.
 *   - SettingsSectionAppearanceOpenAttr.test.tsx pins data-section-open.
 *   - SettingsAppearanceSectionNoId.test.tsx pins absence of `id`.
 *
 * What none of those cover is the ABSENCE of an inline `style` attribute on
 * the Appearance section element itself. A future refactor that introduced
 * e.g. `style={{ display: isOpen("appearance") ? "block" : "none" }}` for
 * collapse behavior, or a JS-driven `style={{ transform: ... }}` for
 * animation, would silently:
 *   1. Bypass the established stylesheet contract for `.settings-card`,
 *      making theme/dark-mode overrides in CSS impossible to apply without
 *      `!important` workarounds.
 *   2. Defeat CSP `style-src` policies that disallow inline styles, which
 *      this app's deployment is free to adopt today precisely because the
 *      section carries no inline style.
 *   3. Couple section visibility to render-time JS state in a way that
 *      conflicts with the existing `data-section-open` attribute contract,
 *      which other tests and consumer CSS already rely on.
 *
 * One focused assertion: the Appearance <section> MUST NOT carry a `style`
 * attribute. Use `hasAttribute("style")` rather than inspecting
 * `.style.cssText` — an empty `style=""` would still be a (broken) public
 * surface that future code or CSP-violation reporters could come to depend
 * on, and DOM `.style` reflection would silently mask its presence.
 */
describe("SettingsPage — Appearance section has no inline style attribute (W2135)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the Appearance <section> does NOT carry a style attribute", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );

    const section = screen.getByTestId("settings-section-appearance");

    // Sanity: confirm we pinned the actual <section> and not some descendant
    // with the same testid by accident. Without this guard a future
    // restructure that moved the testid onto a wrapper could pass the
    // hasAttribute assertion vacuously.
    expect(section.tagName).toBe("SECTION");

    // The actual contract: no `style` attribute on the Appearance section.
    expect(section.hasAttribute("style")).toBe(false);
  });
});
