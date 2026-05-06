import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2912: StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list") is rendered as a plain <ul> with
 * className "stats-week-list" and contains three visible summary rows
 * (Plays / Wins / Avg time). Existing pins already cover the <ul>
 * tagName, exact className, absence of `id`, `role`, inline `style`,
 * `tabindex`, `aria-*` flags, `inert`, `hidden`, etc. — but no
 * existing test pins the absence of a `disabled` attribute on the
 * THIS-week <ul>. While `disabled` is not a valid attribute on a <ul>
 * element, browsers and CSS rules (e.g. `[disabled]` selectors) can
 * still react to its presence, potentially graying out or suppressing
 * interaction with the list contents. Pinning `disabled` absence
 * guarantees the list renders as a normal, fully-enabled summary
 * region with no spurious form-control-style attributes leaking in.
 */
describe("StatsPage stats-this-week-list ul — disabled attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2912: stats-this-week-list <ul> has no disabled attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    expect(list.tagName).toBe("UL");
    expect(list.hasAttribute("disabled")).toBe(false);
    expect(list.getAttribute("disabled")).toBeNull();
  });
});
