import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul>. The HTML `onemptied` attribute is a media
 * event handler attribute defined for media elements (<audio>, <video>),
 * firing when playback is emptied. On a <ul> it has no defined semantics,
 * but leaving it present would still register as an inline event handler
 * via DOM serialization and could be a vector for accidental script
 * execution or mislead future refactors. Sibling tests already pin the
 * absence of `id`, `role`, `style`, `tabindex`, `is`, `cite`, and a broad
 * array of ARIA / global attributes on this <ul>, but none pin the absence
 * of `onemptied`. Pinning it here ensures any future change that
 * accidentally attaches an `onemptied` handler to this presentational
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onemptied attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onemptied attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onemptied")).toBe(false);
    expect(ul.getAttribute("onemptied")).toBeNull();
  });
});
