import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `onended` attribute is a
 * media event handler defined for <audio> and <video> elements, where it
 * fires when playback reaches the end of the media resource. On a <ul> it
 * has no defined semantics, but leaving such an inline event handler present
 * would still be exposed via DOM serialization and could either be silently
 * ignored or, worse, be picked up by some future code path that treats it
 * as executable. Sibling tests already pin the absence of many other
 * attributes on this <ul>, but none pin the absence of `onended`. Pinning
 * it here ensures any future change that accidentally attaches an `onended`
 * handler to this presentational summary list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onended attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onended attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onended")).toBe(false);
    expect(ul.getAttribute("onended")).toBeNull();
  });
});
