import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2629: StatsPage's "Activity" h2 — the section heading inside the
 * `data-testid="stats-activity"` card — is rendered bare with no
 * language override, so it inherits the document-root language for
 * assistive tech and CSS `:lang()` rules. Sibling tests already pin
 * adjacent contracts on this same heading node:
 *   - W1884 pins the heading's className === "" (bare-class contract).
 *   - W1263 pins the heading's parent (.stats-card div with
 *     data-testid="stats-activity").
 *   - W2092 pins the absence of an `id` on every StatsPage h2.
 *   - W2142 pins the absence of an inline `style` attribute on every h2.
 *   - W2491 pins the absence of an explicit `role` attribute on the
 *     activity-card h2 specifically.
 *   - W2518 pins the absence of a `tabindex` attribute on the same h2.
 *   - W2624 pins the absence of a `draggable` attribute on the same h2.
 *
 * What is NOT pinned by any of those tests is the absence of a `lang`
 * attribute on the Activity h2 itself. Adding `lang="en"` (or any other
 * BCP 47 tag) would silently override the document-root language scope
 * for this single heading, changing how screen readers pronounce
 * "Activity", which `:lang()` CSS selectors apply, and how
 * Google Translate / browser translation features treat the subtree —
 * while every other contract still held. Pin the absence of any `lang`
 * attribute on the activity-card h2 so any future change that
 * introduces one is a deliberate, test-acknowledged contract change.
 * The lookup goes through
 * `getByTestId("stats-activity").querySelector("h2")` rather than a
 * role/heading query so the assertion does not depend on heading
 * semantics — it locks the literal `lang` attribute presence on the
 * first h2 inside the activity card.
 */
describe("StatsPage stats-activity — h2 lang attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2629: stats-activity 'Activity' h2 has no lang attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-activity");
    const h2 = card.querySelector("h2");
    expect(h2).not.toBeNull();
    // Sanity: confirm we located the right heading before pinning the
    // lang-absence contract.
    expect(h2!.tagName).toBe("H2");
    expect(h2!.textContent).toBe("Activity");
    // Use `hasAttribute` rather than a value check — even an explicit
    // `lang="en"` would scope a language override onto the heading
    // subtree that `:lang()` CSS selectors and assistive tech can key
    // off of.
    expect(h2!.hasAttribute("lang")).toBe(false);
  });
});
