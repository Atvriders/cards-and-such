import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". There is no
 * standard `onhashchangechanged` event handler attribute in HTML — the real
 * window-level event is `hashchange` (handled via `onhashchange` on <body>
 * or <frameset>), and `onhashchangechanged` is simply a made-up doubly-past-
 * tense typo that would never fire. If such an attribute leaked onto the DOM
 * it would silently do nothing while polluting serialized markup and
 * confusing anyone auditing the element. The sibling lists pin many other
 * stray on*-handler absences; pinning `onhashchangechanged` absence here
 * ensures any future change that accidentally attaches this nonsense
 * attribute to the presentational weekly summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onhashchangechanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onhashchangechanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onhashchangechanged")).toBe(false);
    expect(ul.getAttribute("onhashchangechanged")).toBeNull();
  });
});
