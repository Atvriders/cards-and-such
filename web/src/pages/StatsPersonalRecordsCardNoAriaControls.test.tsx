import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2604: StatsPage's "Personal records" stats card
 * (data-testid="stats-personal-records") is rendered as a plain container
 * that is not a disclosure trigger or composite widget — it does not
 * control or own any other element. Sibling pins on this same node
 * already cover the absence of `aria-label`, `aria-labelledby`,
 * `aria-describedby`, `aria-hidden`, `id`, `style`, `tabindex`, and
 * `role`. What is NOT yet pinned is the absence of an `aria-controls`
 * attribute on the card element itself. Adding `aria-controls` here
 * would falsely advertise that the card programmatically controls some
 * other element (e.g. a panel, listbox, or popup), which would mislead
 * assistive technology and break the contract implied by that ARIA
 * relationship. Pin the absence of an `aria-controls` attribute so any
 * future change that adds one is reviewed deliberately.
 */
describe("StatsPage stats-personal-records card — aria-controls attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2604: stats-personal-records card has no aria-controls attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-personal-records");
    expect(card.hasAttribute("aria-controls")).toBe(false);
  });
});
