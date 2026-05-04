import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W908 — Enter key on a focused drawer category row activates the row,
 * exactly like Space (W812) or click (W644). The drawer keyboard
 * handler (`onDrawerKeyDown` in LobbyPage.tsx ~L772) routes
 * `Enter`/`" "`/`Spacebar` through the SAME `rows[idx]?.click()` arm at
 * L788–L795. Native HTMLButtonElement already fires a synthetic click
 * on Enter, so the explicit handler arm exists primarily so the Enter
 * path stays observably symmetric with Space (which the handler must
 * intercept to suppress page-scroll). W812 pins the Space branch; this
 * file fills the symmetric Enter-key gap.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) because that
 * mega-file is concurrently edited by many agents — adding here avoids
 * merge churn while exercising the same observable contract:
 *   - drawer row aria-current flips to "true"
 *   - chip strip mirrors the activation: chip-solitaire pressed,
 *     chip-all releases (single-select filter, see W267 / W644 / W812).
 */
describe("LobbyPage — drawer Enter activates focused row (W908)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the W812 sibling: widen
    // jsdom's innerWidth above the breakpoint AND stub matchMedia so
    // the lobby's `(min-width: 1024px)` query resolves "desktop"
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

  it("Enter on a focused drawer category row syncs the chip strip filter", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Sanity: drawer mounted at the desktop breakpoint.
    expect(screen.getByTestId("lobby-drawer")).toBeInTheDocument();

    // Pre-state: `all` is the default filter (pressed); `solitaire` is
    // NOT yet pressed. W267 / W644 / W812 all rely on this default
    // shape; we re-assert it as our pre-condition so a regression in
    // the default filter doesn't masquerade as an Enter-handler bug.
    expect(screen.getByTestId("chip-all")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByTestId("chip-solitaire")).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    // Locate and focus the drawer's solitaire row. `onDrawerKeyDown`
    // reads `document.activeElement` to decide which row to activate;
    // without an explicit focus it would fall back to `drawerFocusIdx=0`
    // (the first row, "all") and Enter would no-op against the chip
    // strip — masking a real regression in the Enter branch.
    const row = screen.getByTestId(
      "lobby-drawer-cat-solitaire",
    ) as HTMLButtonElement;
    row.focus();
    expect(document.activeElement).toBe(row);

    // Fire Enter on the focused row. The handler's
    // `key === "Enter"` arm routes through the same `rows[idx]?.click()`
    // path Space uses, so the chip-strip sync is observably identical.
    fireEvent.keyDown(row, { key: "Enter" });

    // Post-Enter contract — same shape W812 pins for Space and W644
    // pins for mouse-click: the drawer row flips active and the chip
    // strip mirrors it because both surfaces share `filter` state.
    expect(row).toHaveAttribute("aria-current", "true");
    expect(screen.getByTestId("chip-solitaire")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    // And the previously-pressed `all` chip releases — the chip strip
    // is single-select (W267), not a toggle bag.
    expect(screen.getByTestId("chip-all")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
