import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1431: The "Records" stats card (the section whose h2 reads "Records")
 * is one of the *exportable* stats cards — its parent <div> wears BOTH
 * `stats-card` (base BEM block) AND the `stats-card--exportable` BEM
 * modifier that flags it as a card whose chart can be downloaded as SVG
 * (the modifier is what positions the floating `.stats-export-btn`
 * relative to the card via CSS). W1263 already pins the `stats-card`
 * base class + `stats-records` testid on the Records h2's parent, but
 * NOTHING pins the BEM modifier class — a refactor that drops
 * `stats-card--exportable` (e.g. inlines the export button without the
 * positioning context, or renames the modifier) would silently break
 * the visual layout while every existing assertion still passes. Pin
 * the modifier class on the Records h2's direct parent so the
 * exportable contract is enforced for that specific section header.
 */
describe("StatsPage Records section — h2 parent stats-card--exportable modifier", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1431: 'Records' h2 parent div carries the stats-card--exportable BEM modifier class", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const heading = screen.getByRole("heading", { level: 2, name: "Records" });
    const parent = heading.parentElement;
    expect(parent).not.toBeNull();
    // Sanity: this is the Records card we expect (W1263 already pins these,
    // but we re-check so a misnamed parent fails fast here too).
    expect(parent!.classList.contains("stats-card")).toBe(true);
    expect(parent!.getAttribute("data-testid")).toBe("stats-records");
    // The actual W1431 contract: the BEM exportable modifier class.
    expect(parent!.classList.contains("stats-card--exportable")).toBe(true);
  });
});
