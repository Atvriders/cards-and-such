import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

/**
 * W2233 — the SettingsPage outer wrapper (the `<div className="settings-
 * page" data-testid="settings-page">` rendered at the top of
 * SettingsPage.tsx) MUST NOT carry a `tabindex` attribute. The wrapper is
 * a passive layout container — it is not interactive, holds no focus
 * trap, and is not the target of any programmatic `.focus()` call. The
 * keyboard tab order should flow directly into the header, the search
 * input, the section toggles, and the per-field controls; the outer
 * wrapper is intentionally not part of that order.
 *
 * Sibling pins already cover other attribute-shape contracts on this
 * exact element:
 *   - W1655 / SettingsPageOuterClass pins `className === "settings-page"`.
 *   - W1663 / SettingsPageOuterClassList pins the classList length.
 *   - W1671 / SettingsPageOuterAttrCount pins `attributes.length === 2`
 *     and the absence of `style`, `role`, `id`, and `hidden` attributes.
 *
 * What none of those cover is an EXPLICIT, by-name lock on the absence
 * of a `tabindex` attribute. While W1671's `attributes.length === 2`
 * incidentally rules out a tabindex addition (any new attribute would
 * fail that count), the count assertion does not name `tabindex` and is
 * sensitive to any unrelated attribute change — adding e.g. an
 * `aria-labelledby` or replacing `data-testid` with `id` would make
 * W1671 fail for a reason that masks a simultaneously-introduced
 * `tabindex`. A name-specific assertion makes the focus-order contract
 * survive that refactor and gives a clearer error message at the failure
 * site.
 *
 * A future change that quietly added `tabIndex={0}` to the wrapper
 * would silently:
 *   1. Insert the entire SettingsPage outer container into the page tab
 *      order BEFORE the header, search input, and section toggles, so a
 *      user pressing Tab on entry would land on a passive wrapper with
 *      no visible affordance before reaching the first real control.
 *   2. With `tabIndex={-1}`, make the wrapper programmatically focusable
 *      (`element.focus()` would succeed) and create a new undeclared
 *      focus surface that screen-reader scripts, e2e flows, and skip-
 *      link targets could come to rely on. The wrapper is currently
 *      neither a skip-link target nor a focus-restore target on
 *      navigation.
 *
 * One focused assertion: the wrapper MUST NOT carry a `tabindex`
 * attribute at all. If a future change deliberately needs one (e.g. a
 * skip-to-main-content target), it should add it AND update this pin in
 * the same commit, making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not SettingsPage.test.tsx) following the
 * established W1655 / W1663 / W1671 / W2228 pattern so the test shares
 * the `src/pages/Settings` vitest path filter without colliding with
 * concurrent edits to other Settings test files.
 */
describe("SettingsPage — outer wrapper has no tabindex attribute (W2233)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the settings-page wrapper does NOT carry a tabindex attribute", () => {
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

    // The actual contract: no `tabindex` attribute on the wrapper.
    // `hasAttribute` (rather than a specific-value check) catches both
    // `tabIndex={0}` (would pull the wrapper into the tab order) and
    // `tabIndex={-1}` (would make it programmatically focusable),
    // because either would create a new undeclared focus surface on a
    // passive layout container.
    expect(root.hasAttribute("tabindex")).toBe(false);
  });
});
