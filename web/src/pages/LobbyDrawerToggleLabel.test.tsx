import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1134 — the desktop drawer collapse/expand toggle button exposes TWO
 * pieces of human-facing text that swap in lockstep with the collapsed
 * state: the `aria-label` ("Collapse category drawer" vs
 * "Expand category drawer") consumed by screen readers, AND the `title`
 * tooltip ("Collapse" vs "Expand") consumed by sighted hover users.
 * The chevron glyph inside (`‹` vs `›`) is the third surface — and it
 * is `aria-hidden`, so AT users depend entirely on the label/tooltip
 * pair flipping correctly.
 *
 * W625 in LobbyPage.test.tsx pins `data-collapsed`, `aria-expanded`, and
 * the persisted localStorage sentinel — but it never asserts the actual
 * label/tooltip/glyph TEXT. A regression that hard-coded the label to
 * one direction (e.g. always "Collapse category drawer") would slip
 * past W625 because aria-expanded already encodes the state — yet a
 * blind user toggling the button would hear the wrong verb on every
 * second click. This file fills exactly that observable gap.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) because that
 * mega-file is concurrently edited by many agents — adding here avoids
 * merge churn while pinning a distinct contract.
 */
describe("LobbyPage — drawer toggle label/tooltip/glyph swap (W1134)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the W908 sibling: widen
    // jsdom's innerWidth above the breakpoint AND stub matchMedia so
    // the lobby's `(min-width: 1024px)` query resolves "desktop"
    // before render — without this the drawer aside (and its toggle)
    // would not mount at all.
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

  it("aria-label, title, and chevron glyph all flip when the toggle is clicked", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const toggle = screen.getByTestId("lobby-drawer-toggle");

    // Default-hydrated state: drawer is EXPANDED, so the button's job
    // is to "Collapse" — the verb on the label/tooltip names the
    // ACTION, not the current state. Same convention as a disclosure
    // button: `aria-expanded="true"` + label "Collapse …".
    expect(toggle).toHaveAttribute("aria-label", "Collapse category drawer");
    expect(toggle).toHaveAttribute("title", "Collapse");
    // The chevron glyph is the visual mirror — `‹` (left-pointing) when
    // the drawer is open and the click would push it shut. The span is
    // `aria-hidden`, but its textContent is still observable in the DOM.
    expect(toggle.textContent).toBe("‹");

    fireEvent.click(toggle);

    // After one click the drawer is COLLAPSED, so the action verb
    // inverts to "Expand" on BOTH surfaces — and the glyph flips to
    // `›` (right-pointing) to point in the direction the next click
    // would expand toward.
    expect(toggle).toHaveAttribute("aria-label", "Expand category drawer");
    expect(toggle).toHaveAttribute("title", "Expand");
    expect(toggle.textContent).toBe("›");

    // Toggling back must restore the original triple — proves the swap
    // is bidirectional, not a one-shot "set to Expand and stick".
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-label", "Collapse category drawer");
    expect(toggle).toHaveAttribute("title", "Collapse");
    expect(toggle.textContent).toBe("‹");
  });
});
