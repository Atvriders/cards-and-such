import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onpointerlockstate` attribute is not a defined HTML event handler attribute
 * (the Pointer Lock API exposes a `pointerlockchange` event on Document, not a
 * pointer-lock-state handler on arbitrary elements). Placing it on a <ul>
 * carries no defined semantics, but leaving it present would still be exposed
 * via DOM serialization and could mislead future refactors that try to
 * interpret it as a pointer-lock state handler. Pinning its absence ensures
 * any future change that accidentally attaches an `onpointerlockstate`
 * attribute to this presentational weekly summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onpointerlockstate attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onpointerlockstate attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpointerlockstate")).toBe(false);
    expect(ul.getAttribute("onpointerlockstate")).toBeNull();
  });
});
