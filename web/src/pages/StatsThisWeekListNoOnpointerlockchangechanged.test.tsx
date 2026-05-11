import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onpointerlockchangechanged` token is not a defined HTML event handler
 * attribute (the real Pointer Lock API uses `pointerlockchange` /
 * `onpointerlockchange` on Document, not a `changed` variant on a <ul>).
 * Attaching such a misspelled or invented event-handler attribute to a
 * presentational <ul> would still be serialized into the DOM and could
 * confuse linters, accessibility tooling, or future refactors that try to
 * interpret it as a real handler. Pinning the absence here ensures any
 * future change that accidentally introduces an `onpointerlockchangechanged`
 * attribute on `stats-this-week-list` is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onpointerlockchangechanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onpointerlockchangechanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpointerlockchangechanged")).toBe(false);
    expect(ul.getAttribute("onpointerlockchangechanged")).toBeNull();
  });
});
