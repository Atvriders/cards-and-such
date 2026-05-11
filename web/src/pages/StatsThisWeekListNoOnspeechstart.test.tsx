import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins absence of the `onspeechstart` attribute on the StatsPage current-week
 * breakdown list (data-testid="stats-this-week-list"). `onspeechstart` is not
 * a standard HTML event handler attribute; if it were ever serialized onto
 * this presentational <ul>, it would either be inert dead weight or, worse,
 * a hook for non-standard speech-recognition behavior on a list that has no
 * speech affordance. This test ensures any future change that accidentally
 * attaches an `onspeechstart` attribute is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onspeechstart attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onspeechstart attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onspeechstart")).toBe(false);
    expect(ul.getAttribute("onspeechstart")).toBeNull();
  });
});
