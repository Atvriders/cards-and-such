import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

/**
 * W2346 — the SettingsPage outer wrapper (the `<div className="settings-
 * page" data-testid="settings-page">` rendered at the top of
 * SettingsPage.tsx around L641) MUST NOT carry an `aria-labelledby`
 * attribute. The wrapper is a passive layout container — it is not
 * exposed as a landmark, has no implicit ARIA role, and is not the
 * accessibility-tree anchor for the page. Per-section accessibility
 * naming is owned by the inner `<section aria-labelledby="settings-
 * <area>-heading">` elements (Appearance / Audio / Gameplay / Data),
 * each pointing at its own `<h2>` heading id; routing those names
 * through the outer wrapper would double-name the document and confuse
 * screen-reader region navigation.
 *
 * Sibling pins already cover other attribute-shape contracts on this
 * exact element:
 *   - W1655 / SettingsPageOuterClass pins `className === "settings-page"`
 *     and `tagName === "DIV"`.
 *   - W1663 / SettingsPageOuterClassList pins `classList.length === 1`.
 *   - W1671 / SettingsPageOuterAttrCount pins `attributes.length === 2`
 *     and the absence of `style`, `role`, `id`, and `hidden` attributes.
 *   - W2233 / SettingsPageRootNoTabindex pins the absence of `tabindex`
 *     by name.
 *
 * What none of those cover is an EXPLICIT, by-name lock on the absence
 * of an `aria-labelledby` attribute. While W1671's `attributes.length
 * === 2` incidentally rules out an aria-labelledby addition (any new
 * attribute would fail that count), the count assertion does not name
 * `aria-labelledby` and is sensitive to any unrelated attribute change
 * — adding e.g. a `lang` attribute or replacing `data-testid` with `id`
 * would make W1671 fail for a reason that masks a simultaneously-
 * introduced `aria-labelledby`. A name-specific assertion makes the
 * accessibility-naming contract survive that refactor and gives a
 * clearer error message at the failure site, exactly as W2233 does for
 * `tabindex`.
 *
 * A future change that quietly added `aria-labelledby={...}` to the
 * wrapper would silently:
 *   1. Inject an undeclared accessible name onto a passive layout
 *      container, which (combined with any future role/landmark
 *      promotion) could surface a duplicate region in screen-reader
 *      rotor menus alongside the per-section regions that already own
 *      their own labelled-by wiring.
 *   2. Couple the outer wrapper to a heading id elsewhere in the
 *      subtree, creating a hidden dependency that would silently break
 *      if that heading were renamed or moved without a coordinated
 *      update here.
 *
 * One focused assertion: the wrapper MUST NOT carry an
 * `aria-labelledby` attribute at all. If a future change deliberately
 * needs one (e.g. promoting the wrapper to a landmark with an explicit
 * label), it should add it AND update this pin in the same commit,
 * making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not SettingsPage.test.tsx) following the
 * established W1655 / W1663 / W1671 / W2233 pattern so the test shares
 * the `src/pages/Settings` vitest path filter without colliding with
 * concurrent edits to other Settings test files.
 */
describe("SettingsPage — outer wrapper has no aria-labelledby attribute (W2346)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the settings-page wrapper does NOT carry an aria-labelledby attribute", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );

    const root = screen.getByTestId("settings-page");

    // Sanity: confirm we resolved the wrapper element itself and not a
    // descendant — the contract under test is specifically the outer
    // `<div className="settings-page">`, identified by its testid + the
    // stable className. A future restructure that moved the testid onto
    // an inner element would (correctly) need to update this pin.
    expect(root.tagName).toBe("DIV");
    expect(root.className).toBe("settings-page");

    // The actual contract: no `aria-labelledby` attribute on the
    // wrapper. `hasAttribute` (rather than a specific-value check)
    // catches any value — a non-empty id reference, an empty string, or
    // a comma-separated list — because any of them would create a new
    // undeclared accessible-name surface on a passive layout container.
    expect(root.hasAttribute("aria-labelledby")).toBe(false);
  });
});
