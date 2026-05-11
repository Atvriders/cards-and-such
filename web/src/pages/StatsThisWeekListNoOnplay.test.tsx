import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `onplay` attribute is a media event handler intended for <audio> and <video>
 * elements; it fires when playback begins. On a <ul> it has no defined
 * semantics and would be inert in practice, but its presence would still be
 * exposed via DOM serialization and could be interpreted as an inline event
 * handler — a vector for accidental script execution if the value were ever
 * sourced from untrusted input. Pinning its absence here ensures any future
 * change that attaches an `onplay` handler to this presentational weekly
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onplay attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onplay attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onplay")).toBe(false);
    expect(ul.getAttribute("onplay")).toBeNull();
  });
});
