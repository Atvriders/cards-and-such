import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

/**
 * W2195 — focused coverage that the SettingsPage volume `<input>` does NOT
 * carry an inline `style` attribute. The volume slider is rendered around
 * line 984 of SettingsPage.tsx and intentionally delegates ALL of its
 * visual presentation to the `.settings-range` CSS class. The element
 * exposes `id`, `type="range"`, `min`/`max`/`step`, `value`, `disabled`,
 * `className`, `data-testid="settings-volume"`, and `aria-valuetext` —
 * but no inline `style`.
 *
 * Sibling pins on this same volume `<input>` already cover:
 *   - SettingsVolumeInputIdAttr.test.tsx        — id="settings-volume".
 *   - SettingsVolumeInputMinAttr.test.tsx       — min="0".
 *   - SettingsVolumeInputRangeClass.test.tsx    — className="settings-range".
 *   - SettingsVolumeLabelHtmlFor.test.tsx       — label htmlFor link.
 *   - SettingsPage.test.tsx                     — min/max/step/aria-valuetext.
 *
 * None of those guard the ABSENCE of an inline `style` attribute on the
 * volume input itself. A future refactor that introduced e.g.
 * `style={{ accentColor: theme.accent }}` to colorize the slider track,
 * or `style={{ "--volume-fill": ... } as ...}` to back a custom-progress
 * gradient, would silently:
 *   1. Bypass the established `.settings-range` stylesheet contract,
 *      making theme/dark-mode overrides in CSS hard to apply without
 *      `!important`.
 *   2. Couple the slider's render output to per-render JS measurement,
 *      reintroducing patterns this page deliberately avoids by leaning
 *      on CSS classes + attribute selectors.
 *   3. Defeat CSP `style-src` policies that disallow inline styles, which
 *      this app's deployment is free to adopt today precisely because
 *      the volume slider carries no inline style.
 *
 * One focused assertion: the volume `<input>` MUST NOT carry a `style`
 * attribute. If a future change deliberately needs inline style, it
 * should add the new attribute AND update this pin in the same commit,
 * making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not SettingsPage.test.tsx) following the
 * established W2045 / W909 / W18xx / W2134 pattern so the test shares
 * the `src/pages/Settings` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("SettingsPage — volume input has no inline style attribute (W2195)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the volume <input> does NOT carry a style attribute", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );

    const volumeInput = screen.getByTestId("settings-volume");

    // Sanity: confirm we pinned the actual <input> (range slider) and
    // not some wrapper. Without this guard a future restructure that
    // moved the data-testid onto a parent div could pass vacuously.
    expect(volumeInput.tagName).toBe("INPUT");
    expect((volumeInput as HTMLInputElement).type).toBe("range");

    // The actual contract: no `style` attribute on the volume input.
    // Use `hasAttribute` rather than inspecting `.style.cssText` — an
    // empty `style=""` would still be a (broken) public surface that
    // future code or CSP-violation reporters could come to depend on,
    // and DOM `.style` reflection would silently mask its presence.
    expect(volumeInput.hasAttribute("style")).toBe(false);
  });
});
