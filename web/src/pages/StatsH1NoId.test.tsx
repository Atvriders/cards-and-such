import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1580: StatsPage's page-level `<h1>Your stats</h1>` is rendered as a bare
 * heading with NO `id` attribute — the title is intentionally not a
 * fragment-link target. W823 pins the text, W1390 pins it as
 * `.stats-page-head`'s firstElementChild, and W1570 pins the absence of a
 * className — but none of them pin the absence of an `id`. A refactor that
 * adds e.g. `id="stats-title"` (to wire up `aria-labelledby` on a section
 * or to scroll-target the heading) would silently turn the h1 into a
 * fragment anchor (`#stats-title`) that bookmarks and deep-links would
 * begin to depend on, locking the implementation into that id forever.
 * Pin the no-id contract so adding an anchor target is a deliberate,
 * test-acknowledged change.
 */
describe("StatsPage header — h1 has no id attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1580: page-level h1 'Your stats' renders with no id attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const heading = screen.getByRole("heading", { level: 1, name: "Your stats" });
    expect(heading.tagName).toBe("H1");
    // Pin the no-id contract: the heading must not be a fragment-link
    // target. `id` is a string property that defaults to "" when absent.
    expect(heading.id).toBe("");
    expect(heading.hasAttribute("id")).toBe(false);
  });
});
