import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onpointerlockerror` content
 * attribute is an inline event-handler hook that, if present, would cause the
 * browser to eval its value as JavaScript whenever the Pointer Lock API fires
 * a pointerlockerror event on the document. This presentational summary list
 * has no interaction with Pointer Lock and should never carry an inline
 * handler — leaving one in place would be both dead surface area and an XSS
 * sink waiting for a future refactor. Pinning the attribute's absence here
 * ensures any accidental introduction is reviewed deliberately rather than
 * slipping in unnoticed alongside the sibling event-handler absence tests.
 */
describe("StatsPage stats-prev-week ul — onpointerlockerror attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onpointerlockerror attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpointerlockerror")).toBe(false);
    expect(ul.getAttribute("onpointerlockerror")).toBeNull();
  });
});
