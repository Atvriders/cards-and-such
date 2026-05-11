import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `onemptied` attribute is a media-event handler defined on <audio> and
 * <video> elements; it fires when a media resource becomes empty. On a <ul>
 * it has no defined semantics and would never fire, but if present it would
 * still be exposed via DOM serialization and could be parsed as an inline
 * event handler by the browser, expanding the surface area for accidental
 * script execution or audit-tool false positives. Many other attribute
 * absences are already pinned on this element (cite, id, role, style, ARIA,
 * other media-event handlers, etc.), but no test pins `onemptied` absence.
 * Pinning it here ensures any future change that accidentally attaches an
 * `onemptied` handler to this presentational weekly summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onemptied attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onemptied attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onemptied")).toBe(false);
    expect(ul.getAttribute("onemptied")).toBeNull();
  });
});
