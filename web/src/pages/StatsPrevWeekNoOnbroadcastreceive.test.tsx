import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul>. The `onbroadcastreceive` attribute is not a
 * defined HTML event handler attribute on any standard element and carries
 * no defined semantics on a <ul>. Pinning its absence here ensures any
 * future change that accidentally attaches an `onbroadcastreceive` handler
 * attribute to this presentational summary list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onbroadcastreceive attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onbroadcastreceive attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onbroadcastreceive")).toBe(false);
    expect(ul.getAttribute("onbroadcastreceive")).toBeNull();
  });
});
