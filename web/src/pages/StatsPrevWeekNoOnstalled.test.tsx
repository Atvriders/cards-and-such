import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain presentational <ul>. The `onstalled` IDL attribute is
 * the inline event-handler hook for the HTMLMediaElement `stalled` event,
 * meaningful only on <audio> and <video> elements that buffer network media.
 * Attaching it to a static <ul> would never fire, but its presence in the
 * serialized DOM could mislead future refactors, scanners, or assistive
 * tooling that treat any `on*` attribute as a live handler. Sibling tests
 * already pin the absence of many handler and global attributes on this
 * <ul>; pinning `onstalled` here closes one more gap so that any future
 * change which accidentally attaches a media-stall handler to this
 * presentational list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-prev-week ul — onstalled attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onstalled attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onstalled")).toBe(false);
    expect(ul.getAttribute("onstalled")).toBeNull();
  });
});
