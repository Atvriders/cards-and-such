import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2514: StatsPage's `.achievements-grid` div — the container that wraps
 * each `.achievement-card` (or the `.stats-empty` placeholder when the
 * filtered list is empty) inside the achievements card
 * (data-testid="stats-achievements") — carries NO `id` attribute.
 *
 * Sibling pins on this very element already cover its tagName (W1890,
 * StatsAchievementsContainerTag), its direct-child count (W2322,
 * StatsAchievementsGridChildCount), and its EXACT className equality
 * (W2417, StatsAchievementsGridClassName). What is NOT pinned is the
 * absence of an `id` attribute on the grid itself.
 *
 * The container is — by design — selected via the `.achievements-grid`
 * class hook everywhere it is referenced (StatsPage.tsx ~L1760, the
 * `.achievements-grid > *` traversals at ~L286/L319/L1353/L1700 in
 * StatsPage.test.tsx, the W2322/W2417/W1890 pins above, plus the
 * downstream CSS rules that own the responsive grid layout). It has
 * no semantic role (no aria-labelledby/aria-describedby targets it), no
 * skip-link or in-page anchor lands on it, and the React render uses
 * keyed children — none of which require or benefit from a stable
 * DOM `id`.
 *
 * A regression that adds an `id` to this container would (a) introduce a
 * new global identifier surface (HTML `id`s must be unique across the
 * document, and the page already mounts dozens of stats sections), (b)
 * create an in-page fragment-link target whose stability is then
 * implicitly contracted with anyone who deep-links to it, (c) raise CSS
 * specificity past the existing class-based rules and silently shift
 * cascade outcomes, and (d) become a load-bearing query selector for
 * future code that bypasses the existing `.achievements-grid` class
 * hook. Every existing pin would stay green through that change. Pin
 * the ABSENCE of `id` so any future refactor that adds one is caught
 * and reviewed deliberately.
 */
describe("StatsPage achievements-grid — id attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2514: .achievements-grid container has no id attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen
      .getByTestId("stats-achievements")
      .querySelector(".achievements-grid") as HTMLElement | null;
    expect(grid).not.toBeNull();
    // Sanity: still a DIV (mirrors W1890) so the absence assertion below
    // is anchored to the same element other pins target.
    expect(grid!.tagName).toBe("DIV");
    // Sanity: the className hook is intact (mirrors W2417) so we know
    // we are pinning the right element and not something else that may
    // happen to also lack an `id`.
    expect(grid!.classList.contains("achievements-grid")).toBe(true);

    // Pin the absence of `id`. The grid is selected exclusively via its
    // `.achievements-grid` class hook; adding an `id` introduces a new
    // global identifier surface, an implicit fragment-link contract, and
    // raises CSS specificity past the existing class rules.
    expect(grid!.hasAttribute("id")).toBe(false);
    // Belt-and-suspenders: the DOM `id` IDL property must also be the
    // empty string when no `id` attribute is set. Catches a regression
    // that sets `id=""` (which would still satisfy `hasAttribute("id")
    // === true` but emit an empty-id warning in some toolchains)... wait,
    // actually `id=""` returns `true` for hasAttribute and `""` for
    // .id, so the line above already catches that. This second line
    // pins the IDL view as a defense-in-depth check.
    expect(grid!.id).toBe("");
  });
});
