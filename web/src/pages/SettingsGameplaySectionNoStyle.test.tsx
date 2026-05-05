import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

/**
 * W2136 — the SettingsPage Gameplay <section> MUST NOT carry an inline
 * `style` attribute. The section is rendered around line 1080 of
 * SettingsPage.tsx; its visual presentation is owned entirely by the
 * `settings-card` CSS class, not by any inline style prop.
 *
 * Sibling pins on this same Gameplay section:
 *   - SettingsSectionGameplayClassEq.test.tsx pins exact className.
 *   - SettingsSectionGameplayAriaLabelledBy.test.tsx pins aria-labelledby.
 *   - SettingsSectionGameplayOpenAttr.test.tsx pins data-section-open.
 *   - SettingsGameplaySectionNoId.test.tsx pins absence of `id`.
 *
 * What none of those cover is the ABSENCE of an inline `style` attribute
 * on the Gameplay section itself. A future refactor that introduced e.g.
 * `style={{ display: isOpen("gameplay") ? "block" : "none" }}` or a
 * JS-driven `style={{ height: ... }}` for collapse animation would
 * silently:
 *   1. Bypass the established stylesheet contract for `.settings-card`,
 *      making theme/dark-mode/print overrides in CSS impossible to
 *      apply without `!important` workarounds.
 *   2. Couple the component's render output to per-render measurement
 *      logic, reintroducing layout-thrash patterns the current
 *      `data-section-open` + CSS-driven collapse design specifically
 *      avoids.
 *   3. Defeat CSP `style-src` policies that disallow inline styles, which
 *      this app's deployment is free to adopt today precisely because the
 *      Gameplay section carries no inline style.
 *
 * One focused assertion: the Gameplay <section> MUST NOT carry a `style`
 * attribute. If a future change deliberately needs inline style (e.g.,
 * JS-controlled collapse height), it should add the new attribute AND
 * update this pin in the same commit, making the trade-off explicit.
 */
describe("SettingsPage — Gameplay section has no inline style attribute (W2136)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the Gameplay <section> does NOT carry a style attribute", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );

    const gameplaySection = screen.getByTestId("settings-section-gameplay");

    // Sanity: confirm we pinned the actual <section> element and not a
    // descendant that happens to share the testid via a future refactor.
    expect(gameplaySection.tagName).toBe("SECTION");

    // The actual contract: no `style` attribute on the Gameplay section.
    // Use `hasAttribute` rather than inspecting `.style.cssText` — an
    // empty `style=""` would still be a (broken) public surface that
    // future code or CSP-violation reporters could come to depend on,
    // and DOM `.style` reflection would silently mask its presence.
    expect(gameplaySection.hasAttribute("style")).toBe(false);
  });
});
