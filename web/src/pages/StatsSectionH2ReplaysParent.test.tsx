import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1479: The "Replays" h2 is the section heading of the Replays panel.
 * Existing tests pin (a) the heading text + level via getByRole (W862)
 * and (b) the panel's subtitle className (W1331), the replay row class
 * (W1330-ish), and the "view all" link className — but NOTHING pins the
 * structural relationship between the h2 and its containing panel — i.e.
 * the h2 must sit directly inside the
 * `<div class="stats-card" data-testid="stats-replays-panel">` card. A
 * refactor that pulls the h2 out of the panel (e.g. hoists it above the
 * card) or strips the `stats-card` className from the heading's parent
 * would silently break the panel's visual hierarchy while every existing
 * assertion still passes. Pin the h2's parent classList + data-testid so
 * that contract is enforced.
 */
describe("StatsPage Replays section — h2 parent panel relationship", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1479: 'Replays' h2 is nested inside the .stats-card div with data-testid='stats-replays-panel'", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const heading = screen.getByRole("heading", { level: 2, name: "Replays" });
    const parent = heading.parentElement;
    expect(parent).not.toBeNull();
    // The h2 must be a direct child of the Replays stats-card panel.
    expect(parent!.classList.contains("stats-card")).toBe(true);
    expect(parent!.getAttribute("data-testid")).toBe("stats-replays-panel");
  });
});
