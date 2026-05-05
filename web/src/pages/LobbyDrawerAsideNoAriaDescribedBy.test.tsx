import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2407 — pins the ABSENCE of `aria-describedby` on the desktop drawer's
 * outer `<aside data-testid="lobby-drawer">` element.
 *
 * The drawer aside is currently named via a direct `aria-label="Lobby
 * categories"` (W1167 / LobbyDrawerAside.test.tsx) and is intentionally
 * NOT given a description pointer:
 *
 *   1. The aside has no companion description element (no help text,
 *      no instructions paragraph) — adding `aria-describedby` would
 *      either dangle to a missing id or require introducing new SR
 *      copy, which is a deliberate product decision, not a refactor.
 *
 *   2. AT users iterating landmarks should hear ONLY the stable name
 *      "Lobby categories" (covered by W1167). A regression that
 *      attaches an `aria-describedby` would inject potentially
 *      route-dependent description text into the landmark
 *      announcement, invisibly broadening the surface contract
 *      without breaking the literal aria-label assertion.
 *
 *   3. Sibling pins on this same aside cover:
 *        - W1167 / LobbyDrawerAside.test.tsx  — tagName + aria-label
 *        - LobbyDrawerAsideClass.test.tsx     — exact className
 *        - LobbyDrawerAsideAriaLabelledBy.test.tsx — aria-labelledby absence
 *        - LobbyDrawerAsideNoId.test.tsx      — id absence
 *        - LobbyDrawerAsideNoRole.test.tsx    — role absence
 *        - LobbyDrawerAsideNoStyle.test.tsx   — style absence
 *        - LobbyDrawerAsideNoTabIndex.test.tsx — tabindex absence
 *      None of these pin the absence of `aria-describedby`, so a
 *      regression that adds it would silently slip through.
 *
 * One focused assertion: the outer drawer aside MUST NOT carry an
 * `aria-describedby` attribute. If product later wants a described
 * landmark, this test should be updated together with the new
 * description element and its id, making the trade-off explicit.
 */
describe("LobbyPage — drawer aside aria-describedby absence (W2407)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Mirror the sibling tests so
    // jsdom resolves the `(min-width: 1024px)` media query as desktop
    // and the aside actually mounts — otherwise the test would fail
    // for the wrong reason (missing element, not missing attribute).
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 1280,
    });
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: /min-width:\s*1024/.test(query),
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("the outer drawer aside does NOT carry an aria-describedby attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const aside = screen.getByTestId("lobby-drawer");

    // Sanity: confirm we pinned the OUTER aside, same anchor as the
    // W1167 sibling. Without this, a future restructure that renames
    // the testid onto a non-aside wrapper could pass this assertion
    // vacuously.
    expect(aside.tagName).toBe("ASIDE");

    // The actual pin: aria-describedby must be absent so the
    // landmark's announcement is restricted to its accessible name
    // ("Lobby categories") with no auxiliary description text.
    expect(aside.hasAttribute("aria-describedby")).toBe(false);
  });
});
