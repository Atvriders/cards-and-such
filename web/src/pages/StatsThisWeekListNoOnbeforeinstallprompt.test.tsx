import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onbeforeinstallprompt` event handler attribute belongs on <body> / window
 * as part of the PWA install-prompt flow (BeforeInstallPromptEvent). Attaching
 * it as an inline handler to a presentational <ul> would have no useful effect
 * and could mislead future readers or tooling that scans the DOM for install
 * affordances. Pinning its absence here ensures any future change that
 * accidentally attaches an `onbeforeinstallprompt` handler to this weekly
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onbeforeinstallprompt attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onbeforeinstallprompt attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onbeforeinstallprompt")).toBe(false);
    expect(ul.getAttribute("onbeforeinstallprompt")).toBeNull();
  });
});
