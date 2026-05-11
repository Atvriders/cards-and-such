import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className "stats-week-list stats-week-list--prev".
 * The legacy `onsoundstart` event handler attribute has no defined semantics on
 * a <ul> and is not part of any modern HTML event surface for this element, but
 * leaving it present would still be exposed via DOM serialization and could
 * trigger unexpected handler invocation if any audio-capture polyfill or future
 * refactor begins dispatching `soundstart` events. Sibling tests pin the absence
 * of many other attributes on this <ul>; pinning the absence of `onsoundstart`
 * ensures any future change that accidentally attaches such a handler to this
 * presentational summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-prev-week ul — onsoundstart attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onsoundstart attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onsoundstart")).toBe(false);
    expect(ul.getAttribute("onsoundstart")).toBeNull();
  });
});
