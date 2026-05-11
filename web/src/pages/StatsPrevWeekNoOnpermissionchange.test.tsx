import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with no event handlers. The
 * `onpermissionchange` inline event-handler attribute corresponds to the
 * Permissions API `permissionchange` event and has no meaning on a <ul>.
 * Leaving such a handler attached to a presentational summary list would
 * be exposed via DOM serialization and could trigger unintended script
 * execution or mislead future refactors. Sibling tests already pin the
 * absence of `id`, `role`, `style`, `cite`, and a broad array of ARIA /
 * global / event-handler attributes on this <ul>, but none pin the
 * absence of `onpermissionchange`. Pinning it here ensures any future
 * change that accidentally attaches an `onpermissionchange` handler to
 * this presentational summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onpermissionchange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onpermissionchange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpermissionchange")).toBe(false);
    expect(ul.getAttribute("onpermissionchange")).toBeNull();
  });
});
