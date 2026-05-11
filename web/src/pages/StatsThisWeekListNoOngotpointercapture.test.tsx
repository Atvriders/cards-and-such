import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3227: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `ongotpointercapture` attribute is a global event handler content attribute
 * that, when present in markup, registers a handler for the `gotpointercapture`
 * event fired after an element captures a pointer via setPointerCapture(). This
 * list is a static presentational summary of the current week's daily totals —
 * it never participates in pointer capture, has no drag/draw/gesture surface,
 * and exposes no children that need to observe capture transitions. Authoring
 * an inline `ongotpointercapture="..."` handler on it would attach a
 * string-sourced function to the element, executing arbitrary code on a
 * pointer-capture event that should never occur here, and would be flagged by
 * any reasonable CSP review. The sibling `stats-prev-week` ul already has its
 * `ongotpointercapture` absence pinned (W3226), and a wide array of other
 * this-week-list attribute absences are pinned (id, role, style, tabindex,
 * ARIA, and many handler attributes), but no test pins `ongotpointercapture`
 * absence on `stats-this-week-list`. Pinning it here ensures any future change
 * that accidentally attaches an `ongotpointercapture` handler to this
 * presentational weekly summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — ongotpointercapture attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3227: stats-this-week-list ul has no ongotpointercapture attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ongotpointercapture")).toBe(false);
    expect(ul.getAttribute("ongotpointercapture")).toBeNull();
  });
});
