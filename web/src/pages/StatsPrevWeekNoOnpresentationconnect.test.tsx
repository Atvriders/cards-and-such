import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * a presentational <ul>. The `onpresentationconnect` event handler attribute
 * is associated with the Presentation API on <window>/<presentationrequest>
 * and has no defined meaning on a <ul>. If it leaked onto this element it
 * would register an inline event handler that the browser would attempt to
 * compile as JavaScript. Pinning its absence ensures any future change that
 * accidentally attaches an `onpresentationconnect` handler to this
 * presentational summary list is reviewed deliberately rather than slipping
 * in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onpresentationconnect attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onpresentationconnect attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpresentationconnect")).toBe(false);
    expect(ul.getAttribute("onpresentationconnect")).toBeNull();
  });
});
