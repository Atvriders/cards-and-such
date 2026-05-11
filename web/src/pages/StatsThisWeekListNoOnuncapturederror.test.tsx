import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pin the absence of the `onuncapturederror` attribute on StatsPage's
 * current-week breakdown list (data-testid="stats-this-week-list"). The
 * `onuncapturederror` IDL attribute corresponds to the `uncapturederror`
 * event fired on GPUDevice in WebGPU and has no meaning as an inline event
 * handler on an HTML <ul>. Leaving such an attribute attached to a
 * presentational list would still surface in DOM serialization and could
 * mislead future refactors or assistive tooling that scan for inline event
 * handlers. A wide range of attribute absences on this element are already
 * pinned (cite, id, role, style, tabindex, ARIA, etc.); this test extends
 * that coverage to `onuncapturederror` so any accidental introduction of
 * such a handler is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onuncapturederror attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onuncapturederror attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onuncapturederror")).toBe(false);
    expect(ul.getAttribute("onuncapturederror")).toBeNull();
  });
});
