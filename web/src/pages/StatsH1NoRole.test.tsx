import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2223: StatsPage's page-level `<h1>Your stats</h1>` is a bare native
 * heading element with NO explicit `role` attribute — the implicit ARIA
 * role from the `<h1>` tag itself (`heading` with level 1) is the only
 * role exposed to assistive tech. Existing StatsH1* coverage pins the
 * tagName (W1530), text (W823), absence of id/class/style (W1570/W1580),
 * count (W1610), and ordering (W1390) — but none of them pin the absence
 * of an explicit `role=` attribute on the h1.
 *
 * A refactor that adds e.g. `role="heading"` (redundant) or worse
 * `role="banner"` / `role="presentation"` would either be wasted markup
 * or actively break screen-reader heading navigation by overriding the
 * implicit `heading` role. Pin the no-role contract so any explicit role
 * on the page-level h1 is a deliberate, test-acknowledged change.
 */
describe("StatsPage header — h1 has no role attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2223: page-level h1 'Your stats' renders with no role attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const heading = screen.getByRole("heading", { level: 1, name: "Your stats" });
    expect(heading.tagName).toBe("H1");
    // Pin the no-explicit-role contract: the h1 must rely solely on its
    // implicit `heading` role from the tag, with no `role=` attribute set.
    expect(heading.hasAttribute("role")).toBe(false);
  });
});
