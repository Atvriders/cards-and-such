import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul>. The `onthemechange` attribute is not a standard
 * DOM event handler attribute, but if present it would be serialized as an
 * inline attribute and could be misinterpreted by tooling, scrapers, or
 * future refactors. Sibling tests pin the absence of many other attributes
 * on this element; this test pins the absence of `onthemechange` so that
 * any future change that accidentally adds such a handler is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onthemechange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onthemechange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onthemechange")).toBe(false);
    expect(ul.getAttribute("onthemechange")).toBeNull();
  });
});
