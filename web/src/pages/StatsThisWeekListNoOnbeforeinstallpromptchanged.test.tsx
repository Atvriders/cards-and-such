import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onbeforeinstallpromptchanged` attribute has no defined meaning on any HTML
 * element — `beforeinstallprompt` is a window-level event fired by browsers
 * (Chromium) when a PWA install prompt becomes available, and it has no
 * "changed" variant or per-element handler form. Setting such an attribute on
 * a presentational <ul> would be confusing, serialize into the DOM, and could
 * mislead future refactors that try to interpret it as an event handler or
 * PWA-install signal. Pinning its absence here ensures any future change that
 * accidentally attaches `onbeforeinstallpromptchanged` to this weekly summary
 * list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onbeforeinstallpromptchanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onbeforeinstallpromptchanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onbeforeinstallpromptchanged")).toBe(false);
    expect(ul.getAttribute("onbeforeinstallpromptchanged")).toBeNull();
  });
});
