import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2613: StatsPage's "This week" h2 — the section heading inside the
 * `data-testid="stats-this-week"` card — is intentionally rendered as a
 * bare `<h2>This week</h2>` so assistive tech derives the heading level
 * implicitly from the tag (h2 → aria-level 2). Sibling tests already pin
 * adjacent contracts on this same heading node:
 *   - W1857 pins the heading's tagName === "H2".
 *   - W2456 pins the heading's className === "" (bare-class contract).
 *   - W2512 pins the absence of an `id` attribute on the heading.
 *   - W2524 pins the absence of a `tabindex` attribute on the heading.
 *   - W2541 pins the absence of any explicit `role` on the heading.
 *   - W2556 pins the absence of any `draggable` attribute on the heading.
 *
 * What is NOT pinned by any of those tests is the absence of an explicit
 * `aria-level` attribute on the this-week h2 itself. A refactor that
 * added e.g. `aria-level="2"` (a redundant duplicate of the implicit
 * level the h2 tag already provides) or worse `aria-level="3"` /
 * `aria-level="1"` (which would silently override the document outline
 * level reported to screen readers without altering the visible text,
 * any className, or the tagName === "H2" assertion) would slip past
 * every existing test while breaking the heading hierarchy that
 * screen-reader users rely on to skim StatsPage. Pin the absence of any
 * explicit `aria-level` via `hasAttribute("aria-level")` so even an
 * explicit `aria-level="2"` (the same level the tag already implies)
 * fails the test — any change here should be a deliberate,
 * test-acknowledged contract change. The lookup goes through
 * `getByTestId("stats-this-week").querySelector("h2")` rather than a
 * role/heading query so the assertion does not depend on heading
 * semantics — it locks the literal `aria-level` attribute presence on
 * the first h2 inside the this-week card.
 */
describe("StatsPage stats-this-week — h2 aria-level attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2613: stats-this-week 'This week' h2 has no aria-level attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const h2 = card.querySelector("h2");
    expect(h2).not.toBeNull();
    // Sanity: confirm we located the right heading before pinning the
    // aria-level-absence contract.
    expect(h2!.tagName).toBe("H2");
    expect(h2!.textContent).toBe("This week");
    // Use `hasAttribute` rather than a value check — even an explicit
    // `aria-level="2"` (the same level the h2 tag already implies)
    // serializes on the DOM node and signals a deliberate
    // heading-level override rather than the implicit default.
    expect(h2!.hasAttribute("aria-level")).toBe(false);
  });
});
