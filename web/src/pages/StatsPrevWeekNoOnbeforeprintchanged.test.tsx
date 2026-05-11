import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul>. There is no standard `onbeforeprintchanged`
 * event handler attribute in the HTML or DOM specification — the only
 * print-related handlers are `onbeforeprint` and `onafterprint`, and those
 * are defined on Window, not on arbitrary elements. Pinning the absence of
 * this misspelled / non-existent handler attribute on the presentational
 * <ul> guards against any future change that accidentally serializes an
 * invented inline event-handler attribute onto this element, which could
 * confuse linters, screen readers, or strict HTML validators.
 */
describe("StatsPage stats-prev-week ul — onbeforeprintchanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onbeforeprintchanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onbeforeprintchanged")).toBe(false);
    expect(ul.getAttribute("onbeforeprintchanged")).toBeNull();
  });
});
