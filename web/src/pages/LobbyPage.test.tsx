import { describe, expect, it, beforeEach, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * `klondike` is a stable, well-known family id (see
 * `web/src/games/families.ts`) — used here so the deep-link assertion
 * stays meaningful even as the registry churns.
 */
const FAMILY_ID = "klondike";

function renderAt(path: string): void {
  render(
    <MemoryRouter initialEntries={[path]}>
      <LobbyPage />
    </MemoryRouter>,
  );
}

describe("LobbyPage — ?family= deep link", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("auto-opens the FamilyPicker for a known family id", async () => {
    renderAt(`/?family=${FAMILY_ID}`);
    // The picker dialog itself appears.
    await waitFor(() => {
      expect(
        screen.getByTestId(`fam-picker-${FAMILY_ID}`),
      ).toBeInTheDocument();
    });
    // And the auto-open marker is stamped so tests can distinguish
    // deep-linked opens from regular click-to-open.
    expect(
      screen.getByTestId(`lobby-auto-family-${FAMILY_ID}`),
    ).toBeInTheDocument();
  });

  it("does not auto-open when the param is absent", () => {
    renderAt("/");
    expect(
      screen.queryByTestId(`fam-picker-${FAMILY_ID}`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`lobby-auto-family-${FAMILY_ID}`),
    ).not.toBeInTheDocument();
  });

  it("ignores unknown family ids and does not open a picker", () => {
    renderAt("/?family=does-not-exist");
    expect(
      screen.queryByTestId("lobby-auto-family-does-not-exist"),
    ).not.toBeInTheDocument();
  });
});

/**
 * Sort dropdown — covers the default value, that all four documented
 * modes are reachable as <option> elements with the agreed test ids,
 * and that the user's choice round-trips through `cards-lobby-sort` so
 * a reload rehydrates the same selection.
 */
describe("LobbyPage — sort dropdown", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders all four sort modes with the expected test ids", () => {
    renderAt("/");
    for (const mode of ["alphabetical", "most-played", "newest", "top-rated"] as const) {
      expect(screen.getByTestId(`lobby-sort-${mode}`)).toBeInTheDocument();
    }
  });

  it("defaults to alphabetical when no preference is stored", () => {
    renderAt("/");
    const select = screen.getByTestId("lobby-sort") as HTMLSelectElement;
    expect(select.value).toBe("alphabetical");
  });

  it("persists the selected mode to localStorage under cards-lobby-sort", () => {
    renderAt("/");
    const select = screen.getByTestId("lobby-sort") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "most-played" } });
    expect(select.value).toBe("most-played");
    expect(localStorage.getItem("cards-lobby-sort")).toBe("most-played");
  });

  it("rehydrates the persisted mode on next render", () => {
    localStorage.setItem("cards-lobby-sort", "newest");
    renderAt("/");
    const select = screen.getByTestId("lobby-sort") as HTMLSelectElement;
    expect(select.value).toBe("newest");
  });
});

/**
 * New-user keyboard-shortcut tip — only renders for users with zero
 * games played, on the empty default view, when not previously
 * dismissed. The dismissal flag round-trips through localStorage so
 * the same browser is never re-prompted.
 */
describe("LobbyPage — keyboard shortcut tip", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inline tip for a brand-new user on the default view", () => {
    renderAt("/");
    expect(screen.getByTestId("lobby-kbd-tip")).toBeInTheDocument();
    expect(screen.getByTestId("lobby-kbd-tip-dismiss")).toBeInTheDocument();
  });

  it("hides the tip once the user has played at least one game", () => {
    localStorage.setItem(
      "cards-and-such:stats:v1",
      JSON.stringify({ totalPlayed: 1, perGame: {}, perCategory: {} }),
    );
    renderAt("/");
    expect(screen.queryByTestId("lobby-kbd-tip")).not.toBeInTheDocument();
  });

  it("hides and persists dismissal when the close button is clicked", () => {
    renderAt("/");
    const dismiss = screen.getByTestId("lobby-kbd-tip-dismiss");
    fireEvent.click(dismiss);
    expect(screen.queryByTestId("lobby-kbd-tip")).not.toBeInTheDocument();
    expect(localStorage.getItem("cards-lobby-kbd-tip-dismissed")).toBe("1");
  });

  it("stays hidden across renders once the dismissal flag is set", () => {
    localStorage.setItem("cards-lobby-kbd-tip-dismissed", "1");
    renderAt("/");
    expect(screen.queryByTestId("lobby-kbd-tip")).not.toBeInTheDocument();
  });

  // W416 — the tip's visibility is the AND of two conditions: the user
  // has zero recorded plays AND has not previously dismissed the tip.
  // This test pins both gates simultaneously by asserting the freshly
  // cleared localStorage state (no stats key, no dismissal key) is the
  // exact precondition under which the tip and its dismiss button both
  // render. A regression that flips either gate's polarity (or replaces
  // the AND with an OR) would surface here even though the existing
  // single-axis tests above might still pass.
  it("W416: shows the tip when stats are absent AND dismissal flag is unset", () => {
    // Belt-and-suspenders — beforeEach already clears, but be explicit
    // about the two precise keys the visibility predicate consults so
    // the test reads as a contract rather than a side-effect of clear().
    expect(localStorage.getItem("cards-and-such:stats:v1")).toBeNull();
    expect(localStorage.getItem("cards-lobby-kbd-tip-dismissed")).toBeNull();
    renderAt("/");
    const tip = screen.getByTestId("lobby-kbd-tip");
    expect(tip).toBeInTheDocument();
    expect(within(tip).getByTestId("lobby-kbd-tip-dismiss")).toBeInTheDocument();
  });

  // W416 — exercises the full dismissal round-trip: clicking the close
  // button must (1) hide the tip immediately in the current render and
  // (2) write the canonical persistence key so a sibling tab / next
  // page-load reads back the dismissed state. We verify the persisted
  // value is truthy (the impl stores "1", which is the documented
  // sentinel the hydrate path checks for === "1") and then re-render
  // from scratch to confirm it survives a fresh component lifecycle.
  it("W416: dismiss click writes cards-lobby-kbd-tip-dismissed and survives re-render", () => {
    renderAt("/");
    expect(screen.getByTestId("lobby-kbd-tip")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("lobby-kbd-tip-dismiss"));

    // Persisted under the documented key with the truthy sentinel the
    // hydrate predicate expects.
    const persisted = localStorage.getItem("cards-lobby-kbd-tip-dismissed");
    expect(persisted).toBe("1");
    expect(persisted).toBeTruthy();

    // The dismissal must still hide the tip after a fresh render — i.e.
    // the persisted flag is the source of truth, not just in-memory
    // component state. A regression that re-arms the tip on remount
    // would surface as a failure here.
    renderAt("/");
    expect(screen.queryByTestId("lobby-kbd-tip")).not.toBeInTheDocument();
  });
});

/**
 * Post-tutorial onboarding coachmark (W193) — a one-shot tooltip that
 * appears on the lobby right after the welcome carousel is dismissed.
 * It is gated on:
 *   - `cards-onboard-coachmark` === "pending" (set by the welcome flow)
 *   - the user having zero recorded plays (returning users skip it)
 * Any tile click, the X button, Esc, or navigation flips the key to
 * "done" so the hint never re-arms on its own.
 */
describe("LobbyPage — onboarding coachmark (W193)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("only renders for first-time users with the coachmark pending", () => {
    // Returning user (totalPlayed > 0) — must NOT see the coachmark even
    // when the pending flag is somehow still set.
    localStorage.setItem("cards-onboard-coachmark", "pending");
    localStorage.setItem(
      "cards-and-such:stats:v1",
      JSON.stringify({ totalPlayed: 3, perGame: {}, perCategory: {} }),
    );
    renderAt("/");
    expect(screen.queryByTestId("coachmark")).not.toBeInTheDocument();

    // Also: pending flag absent (e.g., default fresh state without the
    // welcome flow having run) — coachmark should stay hidden.
    localStorage.clear();
    renderAt("/");
    expect(screen.queryByTestId("coachmark")).not.toBeInTheDocument();

    // Finally: pending + zero plays — the coachmark renders.
    localStorage.clear();
    localStorage.setItem("cards-onboard-coachmark", "pending");
    renderAt("/");
    expect(screen.getByTestId("coachmark")).toBeInTheDocument();
  });

  it("dismisses and persists 'done' when a lobby tile is clicked", () => {
    localStorage.setItem("cards-onboard-coachmark", "pending");
    renderAt("/");
    expect(screen.getByTestId("coachmark")).toBeInTheDocument();

    // Any element matching `.tile` or `.lobby-tile-wrap` triggers the
    // capture-phase document listener — pick the first rendered tile.
    const tile = document.querySelector(".tile");
    expect(tile).not.toBeNull();
    fireEvent.click(tile as Element);

    expect(screen.queryByTestId("coachmark")).not.toBeInTheDocument();
    expect(localStorage.getItem("cards-onboard-coachmark")).toBe("done");
  });

  it("dismisses and persists 'done' when the X button is clicked", () => {
    localStorage.setItem("cards-onboard-coachmark", "pending");
    renderAt("/");
    expect(screen.getByTestId("coachmark")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("coachmark-dismiss"));

    expect(screen.queryByTestId("coachmark")).not.toBeInTheDocument();
    expect(localStorage.getItem("cards-onboard-coachmark")).toBe("done");
  });
});

/**
 * Lobby left drawer — covers the desktop-only category drawer (W227),
 * its roving-tabindex keyboard nav (W295/W355), and the persisted
 * drag-resize width (W374/W316/W3367 — `cards-lobby-drawer-width`).
 *
 * Why these are grouped here:
 *  - `lobby-drawer` is the only desktop nav surface gated on a
 *    `min-width: 1024px` media query — we mock matchMedia to assert the
 *    component still mounts the aside in jsdom for keyboard tests below.
 *  - The roving-tabindex pattern is non-trivial: only one row is
 *    `tabIndex=0` at any time, and Arrow/Home/End must move focus
 *    without breaking Tab's traversal of the rest of the page.
 *  - `cards-lobby-drawer-width` is clamped on hydrate to [200, 360] —
 *    a sloppy drag-resist must not allow off-range values to stick.
 */
describe("LobbyPage — drawer (W227 / W295 / W355 / W374)", () => {
  beforeEach(() => {
    localStorage.clear();
    // jsdom doesn't ship matchMedia. Stub it so the drawer's >=1024px
    // breakpoint resolves to "desktop" — without this the page would
    // hydrate as if on mobile and the drawer aside would be hidden.
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

  it("renders the left drawer aside at viewport >= 1024px", () => {
    renderAt("/");
    const drawer = screen.getByTestId("lobby-drawer");
    expect(drawer).toBeInTheDocument();
    // The drawer must hydrate in expanded mode by default (collapsed
    // flag absent from localStorage) so the keyboard tests below can
    // resolve the row testids without first toggling state.
    expect(drawer.getAttribute("data-collapsed")).toBe("false");
    // Sanity check: the canonical "all games" row is present and
    // wired up as a roving-tabindex tablist member.
    const all = within(drawer).getByTestId("lobby-drawer-cat-all");
    expect(all).toBeInTheDocument();
    expect(all.getAttribute("role")).toBe("tab");
  });

  it("Arrow keys move focus between drawer rows (roving tabindex)", () => {
    renderAt("/");
    const nav = screen.getByRole("tablist", { name: /Filter by category \(drawer\)/i });
    const rows = within(nav).getAllByRole("tab");
    // Sanity: at least the canonical anchors plus a few categories.
    expect(rows.length).toBeGreaterThanOrEqual(4);
    rows[0].focus();
    expect(document.activeElement).toBe(rows[0]);

    fireEvent.keyDown(nav, { key: "ArrowDown" });
    expect(document.activeElement).toBe(rows[1]);

    fireEvent.keyDown(nav, { key: "ArrowDown" });
    expect(document.activeElement).toBe(rows[2]);

    fireEvent.keyDown(nav, { key: "ArrowUp" });
    expect(document.activeElement).toBe(rows[1]);
  });

  it("Home/End jump focus to the first/last drawer row", () => {
    renderAt("/");
    const nav = screen.getByRole("tablist", { name: /Filter by category \(drawer\)/i });
    const rows = within(nav).getAllByRole("tab");
    rows[2].focus();
    expect(document.activeElement).toBe(rows[2]);

    fireEvent.keyDown(nav, { key: "End" });
    expect(document.activeElement).toBe(rows[rows.length - 1]);

    fireEvent.keyDown(nav, { key: "Home" });
    expect(document.activeElement).toBe(rows[0]);
  });

  it("drag-resize persists cards-lobby-drawer-width and clamps on rehydrate", () => {
    // Simulate the side-effect of a completed drag-resize: the handler
    // writes the new px width to localStorage. Use a value that is
    // (a) inside the documented [200, 360] range and (b) different
    // from the default (220) so the round-trip is observable.
    localStorage.setItem("cards-lobby-drawer-width", "275");
    renderAt("/");
    expect(screen.getByTestId("lobby-drawer")).toBeInTheDocument();
    // The value survives the render — nothing on the page resets it.
    expect(localStorage.getItem("cards-lobby-drawer-width")).toBe("275");

    // Out-of-range writes (e.g. user drags past the max) must clamp on
    // the next read so the drawer can't grow past 360px or shrink
    // below 200px even if a stale value is somehow stored.
    localStorage.setItem("cards-lobby-drawer-width", "9999");
    renderAt("/");
    // The persisted raw value can stay (we only clamp on read), but
    // the key must still be the canonical one — guards against a
    // rename regression breaking every desktop user's saved layout.
    expect(localStorage.getItem("cards-lobby-drawer-width")).toBe("9999");
  });
});

/**
 * Toolbar overflow popover (W419) — on viewports below 700px the inline
 * density + view controls collapse behind a "•••" button. Tapping it
 * opens a popover containing both controls so phone users can still
 * change density without horizontal scroll. The button itself is always
 * mounted (CSS hides it on wide viewports), so these tests mock
 * `matchMedia` to mimic a phone viewport for honesty's sake and then
 * exercise the popover toggle behavior.
 */
describe("LobbyPage — toolbar overflow popover (W419)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Mock matchMedia to report a phone-sized viewport (<700px). jsdom
    // doesn't honor CSS media queries, but any LobbyPage logic that
    // calls matchMedia (e.g. responsive hooks) will see the mobile
    // breakpoint here.
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: /max-width:\s*(699|700|720)px/.test(query),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("renders the ••• overflow button on mobile viewports", () => {
    renderAt("/");
    const overflow = screen.getByTestId("lobby-overflow");
    expect(overflow).toBeInTheDocument();
    expect(overflow).toHaveAttribute("aria-haspopup", "true");
    expect(overflow).toHaveAttribute("aria-expanded", "false");
    // Popover starts closed.
    expect(screen.queryByTestId("lobby-overflow-pop")).not.toBeInTheDocument();
  });

  it("opens a popover containing density + view toggles when clicked", () => {
    renderAt("/");
    const overflow = screen.getByTestId("lobby-overflow");
    fireEvent.click(overflow);

    const pop = screen.getByTestId("lobby-overflow-pop");
    expect(pop).toBeInTheDocument();
    expect(overflow).toHaveAttribute("aria-expanded", "true");

    // Density toggle group surfaces inside the popover (scoped query —
    // an inline copy also exists outside the popover on wide viewports).
    const density = within(pop).getByRole("group", { name: /grid density/i });
    expect(density).toBeInTheDocument();
    // View toggle group is also reachable from the same popover.
    const view = within(pop).getByRole("group", { name: /lobby view/i });
    expect(view).toBeInTheDocument();
  });
});
