import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul>. The `onbeforeinstallprompt` event handler content
 * attribute is only meaningful on <body> (or via window) to intercept the
 * browser's "Add to Home Screen" / PWA install prompt. Attaching it to a
 * presentational <ul> would have no defined effect, but its presence in the
 * serialized DOM could mislead future refactors, crawlers, or assistive
 * tooling that try to interpret it as an install hook. Sibling tests already
 * pin the absence of many global, ARIA, and event handler attributes on this
 * <ul>; this test pins the absence of `onbeforeinstallprompt` so that any
 * future change that accidentally attaches it to this list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onbeforeinstallprompt attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onbeforeinstallprompt attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onbeforeinstallprompt")).toBe(false);
    expect(ul.getAttribute("onbeforeinstallprompt")).toBeNull();
  });
});
