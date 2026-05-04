import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1426: StatsPage's outermost wrapper — the element carrying both the
 * `stats-page` className and the `data-testid="stats-page"` hook — is
 * implemented as a plain `<div>`, not a semantic landmark (`<main>`,
 * `<section>`, `<article>`). The `.stats-page` selector is referenced from
 * production code (e.g. layout-probe in StatsPage itself) and styles, and
 * an existing test (W797 line 1648) pins the testid presence, but no test
 * pins the wrapper's element TYPE. A refactor that promotes the root to
 * `<main>` would silently inject an implicit `main` landmark — changing
 * accessibility semantics for the whole page — without any test catching
 * it. The page already exposes a `<footer>` landmark; promoting the root
 * to a `main`-flavored landmark deserves an explicit decision. Lock the
 * current `<div>` implementation here.
 */
describe("StatsPage root — stats-page wrapper element type", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1426: stats-page root wrapper is a DIV element (no implicit landmark role)", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const root = screen.getByTestId("stats-page");
    expect(root).not.toBeNull();
    expect(root.classList.contains("stats-page")).toBe(true);
    // Pin the element type so a swap to <main>/<section>/<article>/etc. is caught.
    expect(root.tagName).toBe("DIV");
  });
});
