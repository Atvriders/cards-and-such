import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `onloadeddata` attribute
 * is a media event handler defined on <audio> and <video> elements; it fires
 * when the first frame of the media has finished loading. On a <ul> it has no
 * defined semantics, but as an inline event-handler attribute it would still
 * be parsed by the browser and could execute arbitrary JavaScript if a future
 * refactor accidentally injected user-controlled content into it. Sibling
 * tests already pin the absence of many other inline event-handler and global
 * attributes on this <ul>, but none pin the absence of `onloadeddata`.
 * Pinning it here ensures any future change that accidentally attaches an
 * `onloadeddata` handler to this presentational summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onloadeddata attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onloadeddata attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onloadeddata")).toBe(false);
    expect(ul.getAttribute("onloadeddata")).toBeNull();
  });
});
