import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2745: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is a fully-rendered, always-visible <ul> summarising three read-only stats
 * rows (Prior plays / Prior wins / Prior avg time). It is part of the static
 * "previous week" stats card and must remain visible to all users at all
 * times — there is no toggle, collapsible behaviour, or progressive
 * disclosure attached to this list. Sibling pins already cover the absence
 * of `id`, `role`, `style`, `tabindex`, `aria-label`, `aria-labelledby`,
 * `aria-describedby`, `aria-controls`, `aria-hidden`, and `aria-busy`, but
 * no existing test pins the absence of the HTML `hidden` boolean attribute
 * on this <ul>. Adding `hidden` would completely remove the list from the
 * accessibility tree and the visual layout (browsers apply
 * `display: none`), silently breaking the prior-week summary for every
 * user. Pinning the absence of `hidden` ensures any future refactor that
 * attempts to conditionally hide this list via the boolean attribute is
 * caught and reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — hidden attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2745: stats-prev-week ul has no hidden attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("hidden")).toBe(false);
    expect(ul.getAttribute("hidden")).toBeNull();
  });
});
