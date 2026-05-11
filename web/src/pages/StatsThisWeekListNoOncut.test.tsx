import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3166: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `oncut`
 * attribute is a global event handler attribute that fires when the user cuts
 * the selection of an element to the clipboard. On a presentational summary
 * <ul> there is no legitimate need to react to cut events — the list is not
 * editable, contains no contenteditable descendants relevant to clipboard
 * editing, and shipping an inline `oncut` handler would both execute arbitrary
 * script via DOM-attribute parsing and conflict with the project's preference
 * for React synthetic event handlers attached via props. Many sibling event-
 * handler absences are already pinned on this ul (onclick, oncopy, onpaste,
 * etc.), but no test pins `oncut` absence specifically. Pinning it here
 * ensures any future change that accidentally attaches an `oncut` handler to
 * this presentational weekly summary list is reviewed deliberately rather
 * than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — oncut attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3166: stats-this-week-list ul has no oncut attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("oncut")).toBe(false);
    expect(ul.getAttribute("oncut")).toBeNull();
  });
});
