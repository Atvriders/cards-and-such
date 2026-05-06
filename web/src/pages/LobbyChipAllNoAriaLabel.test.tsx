import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2611 — the `chip-all` button (the "All" sentinel chip rendered at
 * the head of the lobby chip-strip via the shared `Chip` helper at
 * LobbyPage.tsx ~line 1935) MUST NOT carry an `aria-label` attribute
 * in its current shape. The chip is a `role="tab"` (pinned by
 * LobbyChipAllRole.test.tsx) inside a `role="tablist"` chip-strip,
 * and its accessible name is supplied by its visible text content
 * (the translated `lobby.chip.all` label plus the bracketed total
 * count rendered as children of the `<span>` inside the button).
 * Layering an explicit `aria-label` on top would override that name
 * — a WCAG 2.5.3 ("Label in Name") regression where the spoken name
 * no longer matches what sighted users read.
 *
 * The hero category buttons (LobbyPage.tsx ~line 1866) DO ship a rich
 * `aria-label` (`Filter by ${CATEGORY_LABELS[cat]} (${count} games)`)
 * because they are pure-glyph buttons whose icon alone is not a
 * sufficient name. The chip-strip variants are the OPPOSITE shape:
 * they carry the visible label as text children, so an `aria-label`
 * would *replace* (not augment) that name. Pinning its absence here
 * is the load-bearing guard against a future PR that copies the hero
 * pattern onto the strip chips by mistake.
 *
 * Why this needs its OWN per-chip pin:
 *  - The shared `Chip` helper does not pass `aria-label` to ANY chip
 *    today (the `<button>` props are `type`, `role`, `aria-selected`,
 *    `aria-pressed`, `className`, `onClick`, `data-testid` only). But
 *    no existing test reads `hasAttribute("aria-label")` on the
 *    `chip-all` button specifically. Sibling files such as
 *    LobbyChipAllRole.test.tsx, LobbyChipAllNoId.test.tsx,
 *    LobbyChipAllNoStyle.test.tsx and
 *    LobbyChipAllNoAriaControls.test.tsx all fetch the chip via
 *    `data-testid="chip-all"` but each pins a different attribute —
 *    none read the `aria-label` slot.
 *  - LobbyChipArcadeNoAriaLabel.test.tsx (W2599) and
 *    LobbyChipFavoritesNoAriaLabel.test.tsx pin the same attribute
 *    absence on different chips but do not cover chip-all, so a
 *    branch that special-cases the "All" sentinel chip with an
 *    `aria-label` would slip past every existing pin. The "All" chip
 *    is the most likely target for such a regression because it is
 *    the visual head of the strip and the natural place to add an
 *    "Show all games" descriptive label.
 *
 * We resolve the chip via its stable `data-testid="chip-all"` (the
 * literal testId string passed at LobbyPage.tsx ~line 1935) so the
 * lookup is locale-independent and immune to translation-key changes.
 * The assertion uses `hasAttribute("aria-label")` to pin the literal
 * markup absence — confirming the attribute is not present at all,
 * rather than checking for a particular value (which would pass for
 * an empty `aria-label=""`, itself a name-computation bug).
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx
 * or extending an existing chip-all test) mirrors the per-surface-
 * attribute pattern used by LobbyChipArcadeNoAriaLabel.test.tsx
 * (W2599) so this shares the `src/pages/Lobby` vitest path filter
 * without colliding with concurrent edits to either mega-file.
 */
describe("LobbyPage — chip-all has no aria-label attribute (W2611)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders chip-all without an aria-label attribute (visible text supplies the accessible name)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-all") as HTMLButtonElement;

    // The chip's accessible name is computed from its visible text
    // content (translated "All" label + bracketed total count). An
    // explicit `aria-label` would override that name — a WCAG 2.5.3
    // regression. `hasAttribute` reads the literal markup so a
    // regression that adds the prop fails here with a clear diff
    // regardless of the value supplied (including empty-string).
    expect(chip.hasAttribute("aria-label")).toBe(false);
  });
});
