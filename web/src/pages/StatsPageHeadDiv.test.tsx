import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1269: StatsPage's `.stats-page-head` wrapper that groups the page h1
 * ("Your stats") with the `.stats-export-actions` button cluster is
 * implemented as a plain `<div>` element, not a semantic landmark
 * (`<header>`, `<section>`, `<nav>`). W931 already pins the wrapper's
 * className and the h1 + export-actions sibling structure, but no test
 * pins the element TYPE. A refactor that promotes the wrapper to a
 * `<header>` (or any other tag) would change accessibility semantics —
 * adding a `banner` landmark — without any existing test catching it.
 * The page already has a `<footer>` landmark; promoting the head to a
 * banner-flavored landmark deserves an explicit decision, so lock the
 * current `<div>` implementation here.
 */
describe("StatsPage header — stats-page-head wrapper element type", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1269: stats-page-head wrapper is a DIV element (no implicit landmark role)", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const heading = screen.getByRole("heading", { level: 1, name: "Your stats" });
    const head = heading.parentElement;
    expect(head).not.toBeNull();
    expect(head?.classList.contains("stats-page-head")).toBe(true);
    // Pin the element type so a swap to <header>/<section>/etc. is caught.
    expect(head?.tagName).toBe("DIV");
  });
});
