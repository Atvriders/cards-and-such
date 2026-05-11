import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is a
 * presentational <ul> that should not carry any event-handler content
 * attributes. `ongamepaddisconnected` is a global event-handler IDL/content
 * attribute fired on a window when a Gamepad is disconnected; on a <ul> inside
 * the stats summary it carries no meaningful semantics and would only serve to
 * smuggle in inline JavaScript. Pinning the absence of this attribute ensures
 * any future change that accidentally attaches an `ongamepaddisconnected`
 * handler to this list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-prev-week ul — ongamepaddisconnected attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no ongamepaddisconnected attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ongamepaddisconnected")).toBe(false);
    expect(ul.getAttribute("ongamepaddisconnected")).toBeNull();
  });
});
