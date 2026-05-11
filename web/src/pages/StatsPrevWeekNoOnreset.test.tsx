import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3140: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onreset` HTML attribute is an
 * event handler attribute that is only meaningful on <form> elements, where it
 * fires when the form is reset. On a <ul> the attribute carries no defined
 * semantics, but if it were ever set it would still be serialized into the DOM
 * and — because attribute-style event handlers are parsed as inline JavaScript —
 * could execute arbitrary code, bypass the project's CSP posture, and surprise
 * any downstream consumer that scrapes or mirrors this markup. Sibling tests
 * already pin the absence of `id`, `role`, `style`, `tabindex`, `is`, `cite`,
 * and a broad array of ARIA / global attributes on this <ul>, but none pin the
 * absence of `onreset`. Pinning it here ensures any future change that
 * accidentally attaches an `onreset` handler to this presentational summary
 * list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onreset attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3140: stats-prev-week ul has no onreset attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onreset")).toBe(false);
    expect(ul.getAttribute("onreset")).toBeNull();
  });
});
