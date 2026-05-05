import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

/**
 * W2053 — the SettingsPage Gameplay <section> MUST NOT carry an `id`
 * attribute. The section is rendered around line 1080 of SettingsPage.tsx
 * and is anchored externally via its stable
 * `data-testid="settings-section-gameplay"` and named for assistive tech
 * by `aria-labelledby="settings-gameplay-heading"` (the heading itself
 * carries the id, not the section).
 *
 * Sibling pins on this same Gameplay section:
 *   - SettingsSectionGameplayClassEq.test.tsx pins exact className.
 *   - SettingsSectionGameplayAriaLabelledBy.test.tsx pins aria-labelledby.
 *   - SettingsSectionGameplayOpenAttr.test.tsx pins data-section-open.
 *
 * None of those assert the ABSENCE of an `id` attribute on the section
 * itself. A future refactor that added e.g. `id="settings-gameplay"` to
 * the section element would silently:
 *   1. Create a stable URL fragment target (`/settings#settings-gameplay`)
 *      that external links / bookmarks could come to depend on, making
 *      it an undeclared part of the public contract.
 *   2. Risk colliding with the heading's existing
 *      `id="settings-gameplay-heading"` namespace or with the body
 *      region referenced by `aria-controls="settings-gameplay-body"`.
 *   3. Decouple the aria-labelledby relationship from the heading by
 *      tempting future code to point at the section instead.
 *
 * One focused assertion: the Gameplay <section> MUST NOT carry an `id`
 * attribute. If a future change deliberately needs one, it should add
 * the new `id` AND update this pin in the same commit, making the
 * trade-off explicit.
 */
describe("SettingsPage — Gameplay section has no id attribute (W2053)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the Gameplay <section> does NOT carry an id attribute", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );

    const gameplaySection = screen.getByTestId("settings-section-gameplay");

    // Sanity: confirm we pinned the actual <section> element and not a
    // descendant that happens to share the testid via a future refactor.
    expect(gameplaySection.tagName).toBe("SECTION");

    // The actual contract: no `id` attribute on the Gameplay section.
    // Use `hasAttribute` rather than checking for an empty string — an
    // `id=""` would still be a (broken) public surface that future code
    // could come to depend on.
    expect(gameplaySection.hasAttribute("id")).toBe(false);
  });
});
