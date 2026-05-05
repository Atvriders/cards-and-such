import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1893: StatsPage's page-level `<h1>` must render the exact literal text
 * "Your stats" as its `textContent`. W823 pins the heading via the
 * accessible-name lookup (`getByRole("heading", { level: 1, name: "Your stats" })`),
 * which can be satisfied by `aria-label`, `aria-labelledby`, or nested
 * accessible content — none of which is what the page actually renders
 * today. A refactor that swapped the literal "Your stats" child text for
 * an `aria-label="Your stats"` on an empty h1, or that injected hidden
 * decorative spans / icon glyphs into the heading, would still pass W823
 * but silently change the user-visible string.
 *
 * Pin `h1.textContent === "Your stats"` (DOM string equality, not
 * accessible-name lookup) so any drift in the rendered heading copy
 * — extra whitespace, icon prefixes, separate spans — fails loudly.
 */
describe("StatsPage header — h1 textContent equality", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1893: page-level h1 textContent is exactly 'Your stats'", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const heading = screen.getByRole("heading", { level: 1, name: "Your stats" });
    expect(heading.tagName).toBe("H1");
    // Pin the literal rendered string, not just the accessible name.
    expect(heading.textContent).toBe("Your stats");
  });
});
