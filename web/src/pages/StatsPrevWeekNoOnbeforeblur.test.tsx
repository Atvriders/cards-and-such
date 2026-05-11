import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul>. The `onbeforeblur` attribute is not a standard
 * HTML event-handler attribute on modern browsers and carries no defined
 * semantics on a <ul>. Leaving such an attribute present would still be
 * exposed via DOM serialization and could mislead future refactors or be
 * interpreted by legacy tooling. This test pins the absence of
 * `onbeforeblur` on this presentational summary list so any future change
 * that accidentally attaches one is reviewed deliberately.
 */
describe("StatsPage stats-prev-week ul — onbeforeblur attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onbeforeblur attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onbeforeblur")).toBe(false);
    expect(ul.getAttribute("onbeforeblur")).toBeNull();
  });
});
