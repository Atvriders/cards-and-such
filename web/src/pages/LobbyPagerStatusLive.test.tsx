import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1304 — pin the `aria-live="polite"` announcement on the
 * `lobby-pager-status` span inside the pagination footer.
 *
 * In the default "pagination" list-mode the lobby renders a pager footer
 * with Prev / Next buttons flanking a status span that reads
 * "Page <safePage> of <totalPages>". That span MUST carry
 * `aria-live="polite"` so a screen-reader user driving Prev / Next is
 * told which page they have just landed on without the announcement
 * stomping on whatever they were already reading. The class name
 * (`lobby-pager-status`) is the canonical hook in `LobbyPage.css`, so we
 * scope the query by the parent `lobby-pager` testid + that class to
 * avoid coupling to grid contents or sibling `aria-live` regions
 * elsewhere on the page (e.g. `lobby-loaded-count` in infinite mode,
 * which is mutually exclusive in the rendered DOM with the pager).
 *
 * No localStorage seeding is required — `readPersistedListMode()`
 * defaults to "pagination", which is the mode that renders the pager.
 * The default registry has more than PAGE_SIZE entries so totalPages>1
 * and the pager actually renders on first load.
 */
describe("LobbyPage — pager status aria-live polite (W1304)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("lobby-pager-status span carries aria-live=polite for SR pager updates", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Sanity: pagination-mode pager is mounted in the default render.
    const pager = screen.getByTestId("lobby-pager");
    expect(pager).toBeInTheDocument();

    // The status span is class-scoped (no testid) — we look it up under
    // the canonical pager parent so the assertion is unambiguous.
    const status = pager.querySelector(".lobby-pager-status");
    expect(status).not.toBeNull();
    expect(status).toHaveAttribute("aria-live", "polite");
    // Belt-and-suspenders — the visible label includes the "Page" prefix
    // so a regression that drops the live region onto an unrelated span
    // cannot accidentally satisfy the attribute pin above.
    expect(status?.textContent).toMatch(/^Page\s+\d/);
  });
});
