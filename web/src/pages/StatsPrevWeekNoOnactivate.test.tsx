import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul>. `onactivate` is a legacy SVG / non-standard event
 * attribute that has no defined behavior on HTML <ul> elements. Pinning its
 * absence here ensures any future change that accidentally attaches an
 * `onactivate` handler — whether through a copy-paste, a misguided keyboard
 * affordance, or a generic spread of props — is reviewed deliberately rather
 * than slipping into the DOM unnoticed.
 */
describe("StatsPage stats-prev-week ul — onactivate attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onactivate attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onactivate")).toBe(false);
    expect(ul.getAttribute("onactivate")).toBeNull();
  });
});
