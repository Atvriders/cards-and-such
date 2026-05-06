import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2820: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The global `translate` attribute
 * controls whether browser translation tools (e.g. Chrome auto-translate)
 * may translate the element's text content. Sibling contracts already pin
 * the absence of `id`, `role`, `style`, `tabindex`, `dir`, `hidden`,
 * `inert`, `spellcheck`, and many ARIA states on this <ul>, but no test
 * pins the absence of a `translate` attribute. Adding `translate="no"`
 * would suppress browser translation of the prior-week summary labels
 * ("Prior plays", "Prior wins", "Prior avg time") for non-English users,
 * and adding `translate="yes"` would be a redundant noop that still alters
 * the rendered DOM contract. Pinning the absence of `translate` ensures
 * any future change to the localisation/translation behavior of this list
 * is reviewed deliberately.
 */
describe("StatsPage stats-prev-week ul — translate attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2820: stats-prev-week ul has no translate attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("translate")).toBe(false);
    expect(ul.getAttribute("translate")).toBeNull();
  });
});
