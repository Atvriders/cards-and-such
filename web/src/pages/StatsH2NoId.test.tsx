import { beforeEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2092: StatsPage renders multiple section-level `<h2>` headings — "Activity",
 * "Records", "Top played", "Plays by hour of day", "Plays by category × day-of-week",
 * "This week", "Personal records", "Personal records by category",
 * "Most-hinted games", "Replays", and "Achievements". W772 pins the exact
 * h2 count (11), and StatsSectionH2*Parent tests pin each h2's parent
 * section — but none of them pin the GLOBAL contract that NO h2 on the
 * StatsPage carries an `id` attribute. SettingsPage's section h2s, by
 * contrast, intentionally do have ids (used as `aria-labelledby` /
 * fragment-link anchors). Adding an `id` to a StatsPage h2 would silently
 * turn that heading into a stable in-page anchor (e.g. `#activity`,
 * `#replays`) that bookmarks, deep-links, ScrollSpy targets, or
 * `aria-labelledby` references could come to depend on, locking the
 * implementation into that id forever. Pin the absence of an `id` on
 * EVERY StatsPage h2 so any future change that introduces one is a
 * deliberate, test-acknowledged contract change.
 */
describe("StatsPage section headings — every h2 has no id attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2092: every <h2> on StatsPage renders with no id attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const h2s = document.querySelectorAll("h2");
    expect(h2s.length).toBeGreaterThan(0);
    h2s.forEach((h2) => {
      expect(h2.hasAttribute("id")).toBe(false);
    });
  });
});
