import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2605 — the `chip-recently-played` button (emitted by the shared
 * `Chip` helper at LobbyPage.tsx) MUST NOT carry an `aria-label`
 * attribute. The chip is a `role="tab"` (pinned by sibling tests) inside
 * a `role="tablist"` chip-strip, and its accessible name is supplied by
 * its visible text content (the translated "Recently played" label, the
 * `↺` glyph wrapped in `aria-hidden`, plus the bracketed count). Layering
 * an `aria-label` on top would override that visible text — a WCAG 2.5.3
 * ("Label in Name") regression where the spoken name no longer matches
 * what sighted users read.
 *
 * The hero category buttons (LobbyPage.tsx) DO ship a rich `aria-label`
 * (`Filter by ${CATEGORY_LABELS[cat]} (${count} games)`) because they are
 * pure-glyph buttons whose icon alone is not a sufficient name. The
 * chip-strip variants are the OPPOSITE shape: they carry the visible
 * label as text children, so an `aria-label` would *replace* (not
 * augment) that name. Pinning its absence here is the load-bearing guard
 * against a future PR that copies the hero pattern onto chip-recently-played
 * by mistake.
 *
 * Why this needs its OWN per-chip pin:
 *  - The shared `Chip` helper does not pass `aria-label` to ANY chip
 *    today (the `<button>` props are `type`, `role`, `aria-selected`,
 *    `aria-pressed`, `className`, `onClick`, `data-testid` only). But no
 *    existing test reads `hasAttribute("aria-label")` on the
 *    `chip-recently-played` button specifically. Sibling files such as
 *    LobbyChipRecentlyPlayedNoId.test.tsx (W2485),
 *    LobbyChipRecentlyPlayedNoStyle.test.tsx (W2536),
 *    LobbyChipRecentlyPlayedType.test.tsx (W2464),
 *    LobbyChipRecentGlyphAria.test.tsx (W1462) and
 *    LobbyRecentlyPlayedChipBadgeZero.test.tsx (W1175) all fetch the chip
 *    via `data-testid="chip-recently-played"` but each pins a different
 *    attribute — none read the `aria-label` slot.
 *  - LobbyChipArcadeNoAriaLabel.test.tsx (W2599),
 *    LobbyChipBoardNoAriaLabel.test.tsx (W2594) and
 *    LobbyChipCardsNoAriaLabel.test.tsx pin the same attribute absence on
 *    different category chips but do not cover chip-recently-played, so a
 *    branch that special-cased the recently-played chip with an
 *    `aria-label` (e.g. "Show recently played games") would slip past
 *    every existing pin.
 *
 * We resolve the chip via its stable `data-testid="chip-recently-played"`
 * (the testId wired at LobbyPage.tsx) so the lookup is locale-independent
 * and immune to translation-key changes. The assertion uses
 * `hasAttribute("aria-label")` to pin the literal markup absence —
 * confirming the attribute is not present at all, rather than checking
 * for a particular value (which would pass for an empty `aria-label=""`,
 * itself a name-computation bug).
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx or
 * extending an existing chip-recently-played test) mirrors the per-
 * surface-attribute pattern used by LobbyChipArcadeNoAriaLabel.test.tsx
 * (W2599) so this shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits to either mega-file.
 */
describe("LobbyPage — chip-recently-played has no aria-label attribute (W2605)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders chip-recently-played without an aria-label attribute (visible text supplies the accessible name)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-recently-played") as HTMLButtonElement;

    // The chip's accessible name is computed from its visible text
    // content (translated "Recently played" label + bracketed count;
    // the leading `↺` glyph is wrapped in `aria-hidden` so it does not
    // pollute the name). An explicit `aria-label` would override that
    // computed name — a WCAG 2.5.3 regression. `hasAttribute` reads the
    // literal markup so a regression that adds the prop fails here with
    // a clear diff regardless of the value supplied (including
    // empty-string).
    expect(chip.hasAttribute("aria-label")).toBe(false);
  });
});
