import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3274: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `onhashchange` attribute is
 * a window-level event handler content attribute defined on <body> and
 * <frameset>; it fires when the URL fragment identifier changes. On a <ul> it
 * carries no defined semantics, but leaving it present would still be exposed
 * via DOM serialization and could either be silently ignored or — depending on
 * how a future refactor reads it back — be interpreted as executable JavaScript
 * by ad-hoc tooling, posing both a clarity and a (mild) injection-surface risk.
 * Sibling tests already pin the absence of `id`, `role`, `style`, `tabindex`,
 * `is`, `cite`, and a broad array of ARIA / global / event-handler attributes
 * on this <ul>, but none pin the absence of `onhashchange`. Pinning it here
 * ensures any future change that accidentally attaches an `onhashchange`
 * handler attribute to this presentational summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onhashchange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3274: stats-prev-week ul has no onhashchange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onhashchange")).toBe(false);
    expect(ul.getAttribute("onhashchange")).toBeNull();
  });
});
