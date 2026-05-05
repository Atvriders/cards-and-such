import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2259: StatsPage's "Most-hinted games" stats card
 * (data-testid="stats-most-hinted") is a plain content section: it wraps a
 * heading, an empty-state paragraph, and a ranked list whose rows each
 * already contain their own focusable Play link. The card itself is not
 * meant to participate in keyboard tab order — focusing the wrapper would
 * give a screen-reader user no extra information beyond what is already
 * exposed by the h2 and the per-row controls, and would add an empty,
 * confusing tab stop.
 *
 * Sibling tests pin adjacent contracts on this same node:
 *   - StatsMostHintedCardNoId pins the absence of `id`.
 *   - StatsMostHintedCardNoStyle pins the absence of inline `style`.
 *   - StatsMostHintedWrapClass pins the wrapper className.
 *   - StatsSectionH2MostHintedParent pins the nested h2 + parent.
 *   - StatsCardsCount confirms this card is one of the rendered stats
 *     cards.
 *
 * However, no existing test pins the absence of a `tabindex` attribute on
 * the stats-most-hinted card element itself. Adding `tabindex` (whether
 * `0` to make it tabbable or `-1` to make it programmatically focusable)
 * would change keyboard semantics that downstream code or assistive tech
 * could silently come to depend on, turning later removal into a hidden
 * breaking change. Pin the absence of `tabindex` so any future change
 * that adds one is reviewed deliberately.
 */
describe("StatsPage stats-most-hinted card — tabindex attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2259: stats-most-hinted card has no tabindex attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-most-hinted");
    expect(card.hasAttribute("tabindex")).toBe(false);
  });
});
