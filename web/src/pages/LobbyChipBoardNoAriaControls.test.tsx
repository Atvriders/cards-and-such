import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2579 — the `chip-board` button (the per-category board chip in the
 * lobby chip-strip, rendered through the shared `Chip` helper at
 * LobbyPage.tsx) MUST NOT carry an `aria-controls` attribute in its
 * current shape. The chip is a `role="tab"` (pinned by W2555 in
 * LobbyChipBoardRole.test.tsx) inside a `role="tablist"` chip-strip,
 * but the lobby's tab pattern conveys selection via `aria-selected`
 * (pinned by W2523 in LobbyChipBoardAriaSelectedDefault.test.tsx) and
 * the active filter category in component state — there is no
 * separately-addressable tabpanel `id` for the chip to point at. The
 * tile grid that updates in response to the chip click is rendered
 * inline without an `id`, and the chip itself does not own a
 * disjoint region.
 *
 * `aria-controls` would be appropriate ONLY if the chip controlled a
 * disjoint region addressed by `id`; right now the lobby grid carries
 * no such anchor (LobbyGridNoId.test.tsx pins that absence). Pinning
 * `aria-controls` absence here closes the loop on the chip side: a
 * future change that pre-emptively added a dangling
 * `aria-controls="lobby-grid"` (with no matching `id="lobby-grid"`
 * element in the DOM) would break the AT contract by promising a
 * target that does not exist — every existing sibling pin would still
 * pass.
 *
 * Why this needs its OWN per-chip pin:
 *  - The shared `Chip` helper does not pass `aria-controls` to ANY
 *    chip today, but no existing test reads
 *    `hasAttribute("aria-controls")` on the `chip-board` button
 *    specifically. Sibling files such as
 *    LobbyChipBoardRole.test.tsx (W2555),
 *    LobbyChipBoardAriaSelectedDefault.test.tsx (W2523),
 *    LobbyChipBoardType.test.tsx (W2473),
 *    LobbyChipBoardNoId.test.tsx and
 *    LobbyChipBoardNoStyle.test.tsx (W2519) all fetch the chip via
 *    `data-testid="chip-board"` but each pins a different attribute.
 *  - LobbyDrawerToggleNoAriaControls.test.tsx (W2431) pins the same
 *    attribute absence on a sibling surface (the drawer toggle) but
 *    does not cover chip-board, so a branch that special-cases the
 *    board chip with an `aria-controls` would slip past that pin too.
 *
 * We resolve the chip via its stable `data-testid="chip-board"` (the
 * testId wired at LobbyPage.tsx via `testId={`chip-${cat}`}`) so the
 * lookup is locale-independent and immune to translation-key changes.
 * The assertion uses `hasAttribute("aria-controls")` to pin the literal
 * markup absence — confirming the attribute is not present at all,
 * rather than checking for a particular value (which would pass for an
 * empty `aria-controls=""`).
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx
 * or extending an existing chip-board test) mirrors the W2431
 * (drawer-toggle no-aria-controls) per-surface-attribute pattern so
 * this shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits to either mega-file.
 */
describe("LobbyPage — chip-board has no aria-controls attribute (W2579)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders chip-board without an aria-controls attribute (no addressable tabpanel id exists)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-board") as HTMLButtonElement;

    // The chip is a `role="tab"` inside a `role="tablist"` strip but
    // the lobby has no separately-addressable tabpanel id for the chip
    // to point at; a dangling `aria-controls` (with no matching `id`
    // target in the DOM) would mislead AT. `hasAttribute` reads the
    // literal markup so a regression that adds the prop fails here
    // with a clear diff regardless of the value supplied.
    expect(chip.hasAttribute("aria-controls")).toBe(false);
  });
});
