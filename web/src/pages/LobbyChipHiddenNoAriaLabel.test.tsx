import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2609 — the `chip-hidden` button (the "Hidden" filter chip in the
 * lobby chip-strip, rendered through the shared `Chip` helper at
 * LobbyPage.tsx ~line 1957) MUST NOT carry an `aria-label` attribute
 * in its current shape. The chip is a `role="tab"` (pinned by
 * LobbyChipHiddenRole.test.tsx) inside a `role="tablist"` chip-strip,
 * and its accessible name is supplied by its visible text content
 * (the literal "Hidden" label rendered as children plus the bracketed
 * count appended by the shared `Chip` helper). Layering an
 * `aria-label` on top would override the visible text — a WCAG 2.5.3
 * ("Label in Name") regression where the spoken name no longer
 * matches what sighted users read.
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
 *    `chip-hidden` button specifically. Sibling files such as
 *    LobbyChipHiddenRole.test.tsx,
 *    LobbyChipHiddenAriaPressedDefault.test.tsx,
 *    LobbyChipHiddenType.test.tsx,
 *    LobbyChipHiddenNoAriaControls.test.tsx,
 *    LobbyChipHiddenNoId.test.tsx,
 *    LobbyChipHiddenNoStyle.test.tsx and
 *    LobbyChipHiddenGlyphAria.test.tsx all fetch the chip via
 *    `data-testid="chip-hidden"` but each pins a different attribute
 *    — none read the `aria-label` slot.
 *  - Sibling W2594 (LobbyChipBoardNoAriaLabel.test.tsx) pins the
 *    same attribute on `chip-board`, but the "Hidden" chip is a
 *    distinct surface (a hard-coded entry above the CATEGORY_ORDER
 *    map, not driven by it) so a branch that special-cases the
 *    hidden chip with an `aria-label` would slip past every existing
 *    pin.
 *
 * We resolve the chip via its stable `data-testid="chip-hidden"` (the
 * testId wired at LobbyPage.tsx ~line 1961) so the lookup is
 * locale-independent and immune to translation-key changes. The
 * assertion uses `hasAttribute("aria-label")` to pin the literal
 * markup absence — confirming the attribute is not present at all,
 * rather than checking for a particular value (which would pass for
 * an empty `aria-label=""`, itself a name-computation bug).
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx
 * or extending an existing chip-hidden test) mirrors the W2594
 * (chip-board no-aria-label) per-surface-attribute pattern so this
 * shares the `src/pages/Lobby` vitest path filter without colliding
 * with concurrent edits to either mega-file.
 */
describe("LobbyPage — chip-hidden has no aria-label attribute (W2609)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders chip-hidden without an aria-label attribute (visible text supplies the accessible name)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-hidden") as HTMLButtonElement;

    // The chip's accessible name is computed from its visible text
    // content ("Hidden" + bracketed count). An explicit `aria-label`
    // would override that name — a WCAG 2.5.3 regression.
    // `hasAttribute` reads the literal markup so a regression that
    // adds the prop fails here with a clear diff regardless of the
    // value supplied (including empty-string).
    expect(chip.hasAttribute("aria-label")).toBe(false);
  });
});
