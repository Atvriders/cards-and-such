import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain presentational <ul>. The `onmessageerror` content
 * attribute is a global event handler that fires when a MessagePort/Worker
 * receives a message that cannot be deserialized. It has no meaningful
 * purpose on a static summary list, but if it ever leaked onto this element
 * the attribute value would be parsed as JavaScript and executed in the
 * page's origin — a classic vector for stored-XSS-style regressions when
 * server- or storage-derived strings are accidentally spread onto DOM nodes.
 * Sibling tests pin the absence of `id`, `role`, `style`, `tabindex`, `is`,
 * `cite`, and a broad array of ARIA / global attributes on this <ul>, but
 * none pin the absence of `onmessageerror`. Pinning it here ensures any
 * future change that accidentally attaches an `onmessageerror` handler to
 * this presentational list is reviewed deliberately rather than slipping
 * in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onmessageerror attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onmessageerror attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmessageerror")).toBe(false);
    expect(ul.getAttribute("onmessageerror")).toBeNull();
  });
});
