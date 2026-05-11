import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul>. `onerrorchanged` is not a defined HTML event
 * handler attribute: standard DOM uses `onerror` for error events, and
 * there is no `errorchanged` event on any element. Leaving such a
 * misspelled or fabricated handler attribute in the DOM would silently
 * fail to wire up any listener while still appearing in serialization,
 * confusing future readers and tooling. Sibling tests pin the absence of
 * many on* handlers on this <ul>; this test extends that coverage to the
 * `onerrorchanged` attribute so any future regression that attaches it is
 * caught deliberately.
 */
describe("StatsPage stats-prev-week ul — onerrorchanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onerrorchanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onerrorchanged")).toBe(false);
    expect(ul.getAttribute("onerrorchanged")).toBeNull();
  });
});
