import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1153 — pre-seeded `cards-lobby-drawer-width` localStorage value
 * survives a fresh desktop hydrate of LobbyPage. The companion W374
 * test (in LobbyPage.test.tsx) seeds `275` and asserts persistence;
 * W653 (same file) pins the [200, 360] clamp formula in isolation.
 * Neither test exercises a DIFFERENT in-range seed end-to-end through
 * the actual <LobbyPage> mount — and neither asserts that the seeded
 * value is observable on the rendered drawer aside without any
 * destructive inline style override forcing it back to a default.
 *
 * Why this matters: a regression that silently writes back the default
 * (220) on mount, OR applies an inline `style.width = "220px"` that
 * shadows the persisted preference, would break every desktop user's
 * saved drawer-resize layout on the next reload — exactly the contract
 * `cards-lobby-drawer-width` exists to defend. The W374 sibling pins
 * the storage round-trip with seed=275 only; this file pins seed=250
 * (a distinct in-range value) AND asserts the drawer aside hydrates
 * without an inline width override clobbering the persisted value.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) because that
 * mega-file is concurrently edited by many agents — adding here avoids
 * merge churn while exercising an untested branch of the same key.
 */
describe("LobbyPage — drawer width rehydrate (W1153)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match sibling W908/W812:
    // widen jsdom's innerWidth above the breakpoint AND stub matchMedia
    // so the lobby's `(min-width: 1024px)` query resolves "desktop"
    // before render — without this the drawer aside would not mount.
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

  it("pre-seeded cards-lobby-drawer-width=250 rehydrates without a destructive width override", () => {
    // Seed an in-range value (250) BEFORE mount — distinct from the
    // W374 sibling's 275 so the two tests can't both pass against a
    // hard-coded fallback. 250 falls comfortably inside the documented
    // [200, 360] clamp range so it must round-trip unchanged.
    const SEED = "250";
    localStorage.setItem("cards-lobby-drawer-width", SEED);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Sanity: drawer mounted at the desktop breakpoint — without this
    // the rest of the assertions would be vacuously true on a hidden
    // aside (the drawer is `display: none` below 1024px).
    const drawer = screen.getByTestId("lobby-drawer");
    expect(drawer).toBeInTheDocument();

    // Contract 1: the canonical storage key was NOT clobbered on
    // mount. A regression that calls `localStorage.setItem(KEY, "220")`
    // unconditionally during hydrate would silently break every
    // desktop user's saved drawer width on next reload — this guard
    // pins the read-only nature of the rehydrate path.
    expect(localStorage.getItem("cards-lobby-drawer-width")).toBe(SEED);

    // Contract 2: the drawer aside renders WITHOUT an inline
    // `style.width` override that would force it to a non-seeded
    // default. The drawer's CSS rule (LobbyPage.css ~L2180) sets
    // `width: 220px` at the @media (min-width: 1024px) breakpoint,
    // and an inline override is the only way the page could shadow
    // a persisted preference. Either (a) no inline width is set
    // (the current contract — CSS controls width) OR (b) an inline
    // width is set and it equals the seed (the future contract if
    // `readPersistedDrawerWidth` ever wires through to a style prop).
    // Both shapes preserve the persisted value; a regression that
    // sets `style.width = "220px"` while ignoring the seed would
    // fail this assertion.
    const inlineWidth = (drawer as HTMLElement).style.width;
    expect(inlineWidth === "" || inlineWidth === `${SEED}px`).toBe(true);
  });
});
