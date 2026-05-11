import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul>. The `oncanplaythrough` attribute is a media event
 * handler attribute defined for <audio> and <video> elements; it has no
 * defined semantics on a <ul>. Pinning its absence ensures any future change
 * that accidentally attaches an `oncanplaythrough` handler to this
 * presentational summary list is reviewed deliberately rather than slipping
 * in unnoticed.
 */
describe("StatsPage stats-prev-week ul — oncanplaythrough attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no oncanplaythrough attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("oncanplaythrough")).toBe(false);
    expect(ul.getAttribute("oncanplaythrough")).toBeNull();
  });
});
