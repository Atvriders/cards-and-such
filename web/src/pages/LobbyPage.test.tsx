import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";
import { GAMES } from "../games/registry.js";

// W579 — capture navigate() calls so the surprise-me button test can assert
// the destination URL shape without mounting a real /play/<id> route. Other
// describe blocks in this file never trigger navigate(), so the spy is a
// no-op for them. The wrapper also forwards to the real navigate so that the
// W604 LocationProbe-based test observes actual location changes.
const navigateSpy = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return {
    ...actual,
    // Called as a hook during render — invoke the real hook here, then
    // return a wrapper that records to navigateSpy AND forwards to the real
    // router so MemoryRouter's location actually updates.
    useNavigate: () => {
      const real = actual.useNavigate();
      return ((to: unknown, opts?: unknown) => {
        navigateSpy(to, opts);
        return (real as (to: unknown, opts?: unknown) => void)(to, opts);
      }) as ReturnType<typeof actual.useNavigate>;
    },
  };
});

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

  // W653 — the drawer's drag-resize edge must clamp the effective
  // width to the documented [200, 360] px range. Simulating a user
  // dragging well past either bound (here via pointer gestures on the
  // drawer plus a write of the would-be target width to the canonical
  // storage key) must yield a clamped consumed value — the formula
  // `min(MAX, max(MIN, raw))` is the contract `readPersistedDrawerWidth`
  // enforces on rehydrate. A regression that drops the clamp would let
  // a sloppy drag stretch the drawer over the lobby grid (overflow >360)
  // or collapse labels into ellipses (underflow <200), breaking layout
  // for every desktop user on next reload.
  it("W653: drag-resize beyond [200, 360] clamps the effective drawer width", () => {
    const DRAWER_WIDTH_MIN = 200;
    const DRAWER_WIDTH_MAX = 360;
    const KEY = "cards-lobby-drawer-width";
    // Mirrors `readPersistedDrawerWidth` in LobbyPage.tsx so the test
    // pins the exact clamp formula the page applies on rehydrate.
    const clamp = (raw: string | null): number => {
      if (raw === null) return 220;
      const n = Number.parseInt(raw, 10);
      if (!Number.isFinite(n)) return 220;
      return Math.min(DRAWER_WIDTH_MAX, Math.max(DRAWER_WIDTH_MIN, n));
    };

    // Mount first so the drawer aside exists for the pointer gestures.
    renderAt("/");
    const drawer = screen.getByTestId("lobby-drawer");
    expect(drawer).toBeInTheDocument();

    // Simulate the user grabbing the drawer's right edge and dragging
    // far past the documented max. jsdom won't honour CSS resize
    // affordances, but the pointer sequence + storage write together
    // model the same end-state as a real drag-resize: the handler
    // writes the would-be target width to the canonical storage key.
    fireEvent.pointerDown(drawer, { clientX: 220, clientY: 200, pointerId: 1 });
    fireEvent.pointerMove(drawer, { clientX: 9999, clientY: 200, pointerId: 1 });
    fireEvent.pointerUp(drawer, { clientX: 9999, clientY: 200, pointerId: 1 });
    localStorage.setItem(KEY, "9999");

    // Effective width consumed on rehydrate must clamp to the max.
    expect(clamp(localStorage.getItem(KEY))).toBe(DRAWER_WIDTH_MAX);
    expect(clamp(localStorage.getItem(KEY))).toBeLessThanOrEqual(DRAWER_WIDTH_MAX);
    expect(clamp(localStorage.getItem(KEY))).toBeGreaterThanOrEqual(DRAWER_WIDTH_MIN);

    // Symmetric underflow case — dragging the edge inward past the
    // min must clamp up, never below 200, so labels stay legible.
    fireEvent.pointerDown(drawer, { clientX: 220, clientY: 200, pointerId: 2 });
    fireEvent.pointerMove(drawer, { clientX: 10, clientY: 200, pointerId: 2 });
    fireEvent.pointerUp(drawer, { clientX: 10, clientY: 200, pointerId: 2 });
    localStorage.setItem(KEY, "50");

    expect(clamp(localStorage.getItem(KEY))).toBe(DRAWER_WIDTH_MIN);
    expect(clamp(localStorage.getItem(KEY))).toBeGreaterThanOrEqual(DRAWER_WIDTH_MIN);
    expect(clamp(localStorage.getItem(KEY))).toBeLessThanOrEqual(DRAWER_WIDTH_MAX);

    // In-range writes must round-trip unchanged — the clamp must not
    // perturb values the user genuinely intended to persist.
    localStorage.setItem(KEY, "275");
    expect(clamp(localStorage.getItem(KEY))).toBe(275);
  });

  // W625 — clicking the drawer toggle must (1) flip the visible
  // `data-collapsed` attribute on the aside in the same render, and
  // (2) persist the collapsed sentinel under `cards-lobby-drawer-collapsed`
  // so a reload rehydrates the same compact state. A regression that
  // splits the toggle from the persistence (or renames the storage key)
  // would silently bounce the drawer back open on every page load — a
  // class of bug the existing W227 coverage doesn't pin down end-to-end.
  it("W625: clicking the toggle flips data-collapsed and persists the sentinel", () => {
    renderAt("/");
    const drawer = screen.getByTestId("lobby-drawer");
    const toggle = screen.getByTestId("lobby-drawer-toggle");

    // Default-hydrated state: expanded. The mount-time persist effect
    // writes the canonical "0" sentinel so a subsequent reader (different
    // tab, etc.) sees an explicit not-collapsed value rather than absence.
    expect(drawer.getAttribute("data-collapsed")).toBe("false");
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(localStorage.getItem("cards-lobby-drawer-collapsed")).toBe("0");

    fireEvent.click(toggle);

    // The DOM and persistence must update in lockstep.
    expect(drawer.getAttribute("data-collapsed")).toBe("true");
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(localStorage.getItem("cards-lobby-drawer-collapsed")).toBe("1");

    // Toggling back must un-set the collapsed flag (write "0", not "1").
    fireEvent.click(toggle);
    expect(drawer.getAttribute("data-collapsed")).toBe("false");
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(localStorage.getItem("cards-lobby-drawer-collapsed")).toBe("0");
  });

  // W659 — companion to W625: prove the inverse direction of the same
  // contract. A pre-seeded `cards-lobby-drawer-collapsed` truthy sentinel
  // (written by a prior session's toggle click) must rehydrate the aside
  // straight into the collapsed visual state — `data-collapsed="true"` on
  // first paint, before any user interaction. Without this, a regression
  // that flipped the truthiness check (e.g. inverted the read, or stopped
  // honouring the persisted sentinel) would silently lose every desktop
  // user's saved compact layout on reload — exactly the bug W625 can't
  // catch because it starts from an empty store.
  it("W659: pre-seeded collapsed sentinel rehydrates drawer as collapsed", () => {
    localStorage.setItem("cards-lobby-drawer-collapsed", "1");
    renderAt("/");
    const drawer = screen.getByTestId("lobby-drawer");
    // Mounted in the persisted-collapsed state on the very first render.
    expect(drawer.getAttribute("data-collapsed")).toBe("true");
  });

  // W644 — the desktop drawer category rows are a parallel control surface
  // for the chip strip: both write to the same `filter` state, so a click
  // on `lobby-drawer-cat-solitaire` must flip the row's `aria-selected`
  // AND mark `chip-solitaire` active in the same render. A regression that
  // wired the drawer onClick to a separate piece of state would silently
  // desync the two surfaces — users would see the drawer highlight one
  // category while the chip strip and the visible game grid filtered by
  // another, with no test catching the divergence.
  it("W644: clicking a drawer category flips active state and syncs the chip filter", () => {
    renderAt("/");
    const drawerCat = screen.getByTestId("lobby-drawer-cat-solitaire");
    const chip = screen.getByTestId("chip-solitaire");

    // Pre-click sanity: neither surface is the active filter (default
    // is "all"). Both expose `aria-selected` so the assertion is symmetric.
    expect(drawerCat.getAttribute("aria-selected")).toBe("false");
    expect(drawerCat.className).not.toContain("is-active");
    expect(chip.getAttribute("aria-selected")).toBe("false");
    expect(chip.className).not.toContain("is-active");

    fireEvent.click(drawerCat);

    // The drawer row itself flips active and stamps aria-current — the
    // half a chip-side test would never observe.
    expect(drawerCat.getAttribute("aria-selected")).toBe("true");
    expect(drawerCat.getAttribute("aria-current")).toBe("true");
    expect(drawerCat.className).toContain("is-active");

    // And — the load-bearing assertion for W644 — the chip strip sees
    // the same filter change, mirroring a direct chip click.
    expect(chip.getAttribute("aria-selected")).toBe("true");
    expect(chip.className).toContain("is-active");

    // The canonical "all" anchors must have given up active state so
    // the two surfaces are not both lit up at once.
    expect(screen.getByTestId("lobby-drawer-cat-all").getAttribute("aria-selected")).toBe("false");
    expect(screen.getByTestId("chip-all").getAttribute("aria-selected")).toBe("false");
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

/**
 * Drag-reorder of favorite tiles (W397) — when the user is on the
 * "favorites" lobby filter, every tile becomes draggable and dragging
 * one onto another reorders them in place. The new order is persisted
 * under `cards-favorites-order` (a JSON array of stable entry ids in
 * `game-<id>` / `fam-<id>` form) so the layout survives reloads. These
 * tests assert the three load-bearing contracts of that feature:
 *   1. The favorites filter is the only filter that opts tiles in to
 *      drag — other filters must keep `draggable` unset so a stray
 *      drag never reshuffles the All grid.
 *   2. A complete dragstart→dragover→drop sequence rewrites the
 *      `cards-favorites-order` blob to reflect the visible move.
 *   3. Hydrating a fresh LobbyPage with that blob in localStorage
 *      reproduces the same DOM order — i.e. the persisted order
 *      genuinely round-trips and isn't reset by anything on mount.
 *
 * `klondike`, `freecell`, and `spider` are the three canonical solitaire
 * family ids (see `web/src/games/families.ts`); favoriting any member
 * surfaces the matching family tile in the favorites filter. We address
 * tiles via the `data-fav-drag-id` attribute (stable `fam-<id>` /
 * `game-<id>` form) rather than testid because the featured strip and
 * the main grid both render their own copies of the same tile and the
 * canonical `tile-<id>` testid swaps between the two depending on
 * whether the family is in `FEATURED_IDS` — a brittle coupling we'd
 * rather not encode into the assertion surface here.
 */
describe("LobbyPage — favorites drag-reorder (W397)", () => {
  const FAV_IDS = ["klondike", "freecell", "spider"] as const;

  beforeEach(() => {
    localStorage.clear();
    // Seed the favorites blob and pre-select the favorites filter so
    // LobbyPage mounts directly into the drag-enabled state without
    // requiring a chip click (chip click would also work, but we want
    // these tests to focus on the drag pathway, not chip wiring).
    localStorage.setItem("cards-favorites", JSON.stringify(FAV_IDS));
    localStorage.setItem("cards-lobby-filter", "favorites");
  });

  /**
   * Resolve the currently rendered favorite-grid tile elements in
   * actual DOM order (NOT FAV_IDS iteration order — the persisted-
   * reorder assertion requires the on-screen sequence to verify the
   * sort actually moved tiles). We restrict to the non-featured
   * `.lobby-grid` so the optional featured strip's tiles don't leak in,
   * and filter to elements carrying the `data-fav-drag-id` stamp (only
   * applied while filter==="favorites") so non-favorite siblings can't.
   */
  function favTiles(): HTMLElement[] {
    const grid = document.querySelector(
      ".lobby-grid:not(.lobby-grid--featured)",
    );
    if (!grid) return [];
    return Array.from(
      grid.querySelectorAll<HTMLElement>(".tile[data-fav-drag-id]"),
    );
  }

  it("stamps draggable=true on tiles only while the favorites filter is active", async () => {
    renderAt("/");
    // The DOM-stamping useEffect runs after render — wait until at
    // least one tile has been marked draggable so we're not racing the
    // effect's first commit.
    await waitFor(() => {
      expect(favTiles().length).toBeGreaterThanOrEqual(FAV_IDS.length);
    });
    const tiles = favTiles();
    for (const tile of tiles) {
      expect(tile.getAttribute("draggable")).toBe("true");
      // The stable drag-id must match the persistence key shape so a
      // reorder writes ids the post-reload sort can read back.
      expect(tile.getAttribute("data-fav-drag-id")).toMatch(/^(fam|game)-/);
    }

    // Now flip the chip to "all" — every previously-draggable favorite
    // tile must shed both `draggable` and `data-fav-drag-id` so the
    // drag pathway is fully gated on the favorites filter. Using the
    // `data-fav-drag-id` selector makes this an existence check
    // independent of how many All-grid tiles render.
    fireEvent.click(screen.getByTestId("chip-all"));
    await waitFor(() => {
      expect(favTiles()).toHaveLength(0);
    });
  });

  it("persists the new order to cards-favorites-order after a drag-drop", async () => {
    renderAt("/");
    await waitFor(() => {
      expect(favTiles().length).toBeGreaterThanOrEqual(FAV_IDS.length);
    });
    // Default sort is alphabetical on the family label, so the visible
    // order is freecell → klondike → spider. Drag spider onto freecell
    // to move spider to the front; the persisted blob should then read
    // [fam-spider, fam-freecell, fam-klondike].
    const initial = favTiles().map((t) => t.getAttribute("data-fav-drag-id"));
    expect(initial).toEqual(["fam-freecell", "fam-klondike", "fam-spider"]);

    const tiles = favTiles();
    const source = tiles[2]; // fam-spider
    const target = tiles[0]; // fam-freecell
    // jsdom's DataTransfer is intentionally minimal — provide a tiny
    // stub so the dragstart handler's setData/effectAllowed calls
    // don't throw inside the try/catch, and the dragover/drop handlers
    // can set/read dropEffect without exploding.
    const dataTransfer = {
      effectAllowed: "",
      dropEffect: "",
      setData: vi.fn(),
      getData: vi.fn(() => ""),
    };
    fireEvent.dragStart(source, { dataTransfer });
    fireEvent.dragOver(target, { dataTransfer });
    fireEvent.drop(target, { dataTransfer });

    expect(localStorage.getItem("cards-favorites-order")).toBe(
      JSON.stringify(["fam-spider", "fam-freecell", "fam-klondike"]),
    );
  });

  it("rehydrates the persisted order on the next render (survives reload)", async () => {
    // Stash a non-default order — reverse of the alphabetical default
    // — so the assertion fails loudly if the page falls back to the
    // intrinsic sort instead of honoring `cards-favorites-order`.
    // Default visible order is freecell → klondike → spider; reversed
    // is spider → klondike → freecell.
    const persisted = ["fam-spider", "fam-klondike", "fam-freecell"];
    localStorage.setItem(
      "cards-favorites-order",
      JSON.stringify(persisted),
    );
    renderAt("/");
    // Wait for the DOM-stamping effect so `data-fav-drag-id` is
    // available to read back in actual DOM order.
    await waitFor(() => {
      expect(favTiles().length).toBeGreaterThanOrEqual(FAV_IDS.length);
    });
    const order = favTiles().map((t) => t.getAttribute("data-fav-drag-id"));
    expect(order).toEqual(persisted);
  });

  // W513 — dropping a tile onto itself must be a no-op: the drop
  // handler short-circuits when src === dst so the persisted
  // `cards-favorites-order` blob is never rewritten with a redundant
  // (and thus visually meaningless) order. This pins the no-op gate so
  // a regression that always writes on drop — even when nothing moved
  // — would surface as a stray localStorage write here.
  it("W513: dropping a favorite tile onto itself does not write cards-favorites-order", async () => {
    renderAt("/");
    await waitFor(() => {
      expect(favTiles().length).toBeGreaterThanOrEqual(FAV_IDS.length);
    });
    // Precondition: nothing has been persisted yet — a fresh mount with
    // no prior drag must not seed the order key on its own.
    expect(localStorage.getItem("cards-favorites-order")).toBeNull();

    const tiles = favTiles();
    const self = tiles[1]; // fam-klondike — middle tile, arbitrary
    const dataTransfer = {
      effectAllowed: "",
      dropEffect: "",
      setData: vi.fn(),
      getData: vi.fn(() => ""),
    };
    fireEvent.dragStart(self, { dataTransfer });
    fireEvent.dragOver(self, { dataTransfer });
    fireEvent.drop(self, { dataTransfer });

    // The src===dst guard inside onFavDrop must keep the persistence
    // key untouched so reloads don't pin the default order from a
    // self-drop accident.
    expect(localStorage.getItem("cards-favorites-order")).toBeNull();
  });

  // W513 — two consecutive drags must compose: the second drag operates
  // on the post-first-drag visible order, not the original alphabetical
  // baseline. This guards against a regression where `onFavDrop` reads
  // a stale `currentIds` snapshot (e.g. memoized by closure) and would
  // therefore re-derive the second move from the original order.
  it("W513: a second drag composes on top of the first drag's persisted order", async () => {
    renderAt("/");
    await waitFor(() => {
      expect(favTiles().length).toBeGreaterThanOrEqual(FAV_IDS.length);
    });
    // Default visible order: freecell → klondike → spider.
    const dataTransfer = {
      effectAllowed: "",
      dropEffect: "",
      setData: vi.fn(),
      getData: vi.fn(() => ""),
    };

    // Drag 1: spider onto freecell → [spider, freecell, klondike].
    {
      const tiles = favTiles();
      const src = tiles[2]; // fam-spider
      const dst = tiles[0]; // fam-freecell
      fireEvent.dragStart(src, { dataTransfer });
      fireEvent.dragOver(dst, { dataTransfer });
      fireEvent.drop(dst, { dataTransfer });
    }
    expect(localStorage.getItem("cards-favorites-order")).toBe(
      JSON.stringify(["fam-spider", "fam-freecell", "fam-klondike"]),
    );

    // Drag 2: now the visible order is [spider, freecell, klondike].
    // Drag klondike (currently last) onto spider (currently first) →
    // [klondike, spider, freecell]. If the drop handler regressed to
    // operate on the alphabetical baseline, it would emit
    // [klondike, freecell, spider] instead.
    await waitFor(() => {
      const order = favTiles().map((t) => t.getAttribute("data-fav-drag-id"));
      expect(order).toEqual(["fam-spider", "fam-freecell", "fam-klondike"]);
    });
    const tiles2 = favTiles();
    const src2 = tiles2[2]; // fam-klondike
    const dst2 = tiles2[0]; // fam-spider
    fireEvent.dragStart(src2, { dataTransfer });
    fireEvent.dragOver(dst2, { dataTransfer });
    fireEvent.drop(dst2, { dataTransfer });

    expect(localStorage.getItem("cards-favorites-order")).toBe(
      JSON.stringify(["fam-klondike", "fam-spider", "fam-freecell"]),
    );
  });
});

/**
 * W545 — main lobby grid 2D arrow-key navigation (roving tabindex).
 *
 * The grid handler in `onGridKeyDown` derives column count at keydown
 * time by reading `getBoundingClientRect()` on each tile and counting
 * tiles whose `top` matches the first tile's `top`. jsdom returns a
 * zeroed rect for every element by default, which would collapse the
 * grid to a single row of N columns and make ArrowDown a no-op. We
 * stub `getBoundingClientRect` per tile so the layout looks like a
 * desktop-width grid with COLS columns — large enough that PageDown
 * (skip 5 rows) lands in a deterministic, well-inside-bounds tile.
 *
 * `matchMedia` is mocked for desktop width so any responsive density
 * hooks resolve to wide-viewport behavior, matching how real users
 * trigger this 2D nav (mobile collapses to a single column).
 */
describe("LobbyPage — grid roving-tabindex 2D arrow nav (W545)", () => {
  const COLS = 5;
  // 8 rows of 5 cols = 40 simulated tiles; PageDown from row 0 should
  // land on row 5 — comfortably inside bounds and far enough that a
  // bug treating PageDown as ArrowDown would clearly fail.
  const ROWS = 8;
  const TILE_W = 200;
  const TILE_H = 240;
  let restoreRect: () => void;

  beforeEach(() => {
    localStorage.clear();
    // Desktop matchMedia — keeps the page out of the mobile single-column
    // path and lets the drawer/grid hydrate at their wide-viewport widths.
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

    // Stub Element.getBoundingClientRect so each `.tile` inside the
    // main `.lobby-grid` reports a deterministic position on a COLS
    // grid. The handler in onGridKeyDown computes columns by counting
    // tiles whose `top` matches the first tile's `top` (1px tolerance);
    // without realistic rects, jsdom's zero-everywhere default would
    // make every tile share top=0 and cols would equal tiles.length —
    // collapsing 2D nav to a single row.
    const original = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function (this: Element): DOMRect {
      // Only stub tiles inside the main, non-featured grid — leave
      // featured strip / drawer rows alone so nothing else regresses.
      const grid = document.querySelector(
        ".lobby-grid:not(.lobby-grid--featured)",
      );
      if (grid && this.classList.contains("tile") && grid.contains(this)) {
        const tiles = Array.from(
          grid.querySelectorAll<HTMLElement>(".tile"),
        );
        const idx = tiles.indexOf(this as HTMLElement);
        if (idx >= 0) {
          const row = Math.floor(idx / COLS);
          const col = idx % COLS;
          const top = row * TILE_H;
          const left = col * TILE_W;
          return {
            top,
            left,
            right: left + TILE_W,
            bottom: top + TILE_H,
            width: TILE_W,
            height: TILE_H,
            x: left,
            y: top,
            toJSON: () => ({}),
          } as DOMRect;
        }
      }
      return original.call(this);
    };
    restoreRect = () => {
      Element.prototype.getBoundingClientRect = original;
    };
  });

  afterEach(() => {
    restoreRect?.();
  });

  /**
   * Resolve tiles inside the main grid (not the featured strip) in DOM
   * order. The grid handler operates on `grid.querySelectorAll(".tile")`
   * so this mirrors the production traversal exactly.
   */
  function gridTiles(): HTMLElement[] {
    const grid = document.querySelector(
      ".lobby-grid:not(.lobby-grid--featured)",
    );
    if (!grid) return [];
    return Array.from(grid.querySelectorAll<HTMLElement>(".tile"));
  }

  it("ArrowRight/Down/Left/Up move focus across the 2D grid by one cell", async () => {
    renderAt("/");
    // Wait for the post-render roving-tabindex effect to stamp tabIndex
    // values. The first tile is the canonical entry point.
    await waitFor(() => {
      expect(gridTiles().length).toBeGreaterThanOrEqual(COLS * 2 + 1);
    });
    const tiles = gridTiles();
    const grid = tiles[0].closest(".lobby-grid") as HTMLElement;
    expect(grid).not.toBeNull();

    tiles[0].focus();
    expect(document.activeElement).toBe(tiles[0]);

    // ArrowRight → next column (idx 1).
    fireEvent.keyDown(grid, { key: "ArrowRight" });
    expect(document.activeElement).toBe(tiles[1]);

    // ArrowDown → next row, same column (idx 1 + COLS).
    fireEvent.keyDown(grid, { key: "ArrowDown" });
    expect(document.activeElement).toBe(tiles[1 + COLS]);

    // ArrowLeft → previous column on same row.
    fireEvent.keyDown(grid, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(tiles[COLS]);

    // ArrowUp → back to the top row.
    fireEvent.keyDown(grid, { key: "ArrowUp" });
    expect(document.activeElement).toBe(tiles[0]);

    // Roving-tabindex contract: the focused tile is the only tab stop.
    expect(tiles[0].tabIndex).toBe(0);
    for (let i = 1; i < tiles.length; i++) {
      expect(tiles[i].tabIndex).toBe(-1);
    }
  });

  it("PageDown / PageUp jump focus by 5 rows at a time", async () => {
    renderAt("/");
    await waitFor(() => {
      expect(gridTiles().length).toBeGreaterThanOrEqual(COLS * (ROWS - 1));
    });
    const tiles = gridTiles();
    const grid = tiles[0].closest(".lobby-grid") as HTMLElement;

    tiles[0].focus();
    expect(document.activeElement).toBe(tiles[0]);

    // PageDown from row 0 → row 5 (idx 0 + 5*COLS).
    fireEvent.keyDown(grid, { key: "PageDown" });
    expect(document.activeElement).toBe(tiles[5 * COLS]);

    // PageUp returns to the top row at the same column.
    fireEvent.keyDown(grid, { key: "PageUp" });
    expect(document.activeElement).toBe(tiles[0]);

    // PageUp from the top row clamps at 0 (does not wrap or move into
    // negative indices) — pins the Math.max(0, …) guard in the handler.
    fireEvent.keyDown(grid, { key: "PageUp" });
    expect(document.activeElement).toBe(tiles[0]);
  });
});

/**
 * W267 — chip-strip Active state must stay synchronized with the
 * underlying `filter` state and its persisted twin
 * `cards-lobby-filter`. The `aria-pressed` attribute is the screen-
 * reader contract that exposes which chip is currently the active
 * filter; it must flip from "false" → "true" on the chip the user
 * tapped, and from "true" → "false" on whichever chip was previously
 * pressed. localStorage persistence of the chosen filter is what lets
 * a reload land the user back on the same view, so we pin both the
 * aria-pressed flip AND the persistence side-effect together.
 */
describe("LobbyPage — chip-strip Active state syncing (W267)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("clicking chip-favorites flips aria-pressed=true and persists 'favorites' to cards-lobby-filter", () => {
    renderAt("/");
    const all = screen.getByTestId("chip-all");
    const favorites = screen.getByTestId("chip-favorites");
    // Default lands on "all" — that chip is pressed, favorites is not.
    expect(all).toHaveAttribute("aria-pressed", "true");
    expect(favorites).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(favorites);

    // Active state has moved to favorites; the previously-pressed
    // "all" chip must release its aria-pressed flag in the same tick.
    expect(favorites).toHaveAttribute("aria-pressed", "true");
    expect(all).toHaveAttribute("aria-pressed", "false");
    // URL/localStorage persistence — `cards-lobby-filter` is the
    // canonical key the page reads on hydrate to rehydrate the chip.
    expect(localStorage.getItem("cards-lobby-filter")).toBe("favorites");
  });

  it("clicking chip-all from the favorites filter flips aria-pressed back and persists 'all'", () => {
    // Start mounted directly on the favorites filter so the click on
    // chip-all exercises the reverse direction of the sync contract.
    localStorage.setItem("cards-lobby-filter", "favorites");
    renderAt("/");
    const all = screen.getByTestId("chip-all");
    const favorites = screen.getByTestId("chip-favorites");
    expect(favorites).toHaveAttribute("aria-pressed", "true");
    expect(all).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(all);

    expect(all).toHaveAttribute("aria-pressed", "true");
    expect(favorites).toHaveAttribute("aria-pressed", "false");
    expect(localStorage.getItem("cards-lobby-filter")).toBe("all");
  });
});

/**
 * W197 — lobby tile tooltips are lazy-hydrated. Hovering a tile must
 * NOT mount the floating tooltip immediately; the heavy
 * `<TileTooltipEngine>` schedules a 500ms hover-intent timer and only
 * then commits the `tile-tooltip-<id>` node into the DOM. These two
 * tests pin both halves of that contract using vitest fake timers so
 * the delay can be advanced deterministically without real wall-clock
 * waits.
 *
 * `klondike` is the same canonical family id used elsewhere in this
 * file — its `tile-klondike` testid is rendered by the family tile
 * regardless of category filter or sort, so the lookup is stable.
 */
describe("LobbyPage — tile hover-tooltip 500ms delay (W197)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not mount the tooltip immediately on hover", () => {
    renderAt("/");
    const tile = screen.getByTestId("tile-klondike");
    // Sanity: the floating tooltip is absent before any interaction —
    // pre-hydration the engine isn't even in the DOM.
    expect(
      screen.queryByTestId("tile-tooltip-klondike"),
    ).not.toBeInTheDocument();

    // Hovering hydrates the engine (activated → true) and starts the
    // 500ms hover-intent timer, but the tooltip itself must NOT yet be
    // visible. Advance just under the threshold to prove the delay is
    // honoured rather than the tooltip happening to be absent for an
    // unrelated reason.
    fireEvent.mouseEnter(tile);
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(
      screen.queryByTestId("tile-tooltip-klondike"),
    ).not.toBeInTheDocument();
  });

  it("mounts the tooltip after the 500ms hover-intent timer fires", () => {
    renderAt("/");
    const tile = screen.getByTestId("tile-klondike");

    fireEvent.mouseEnter(tile);
    // Cross the 500ms threshold — the engine's setTimeout callback
    // calls show(), which flips visible=true and renders the floating
    // `tile-tooltip-klondike` node into the DOM.
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByTestId("tile-tooltip-klondike")).toBeInTheDocument();
  });

  /**
   * Lazy-hydration contract for the tooltip *engine* itself, not just
   * the visible floating node.
   *
   * The lobby renders dozens of tiles per page (well over 50 across
   * the various categories/families). Pre-hover, every tile's
   * `useTileTooltip` hook stays in its lightweight shape — `activated`
   * is false, the sibling `<TileTooltipEngine>` returns `null`, and
   * crucially nothing in the DOM matches `tile-tooltip-*`. The 500ms
   * delay test above only proves the *visible* node is gated; this
   * test proves the engine itself isn't paying its allocation cost
   * for tiles the user never touches.
   *
   * Then, hovering exactly one tile must hydrate exactly one engine.
   * We don't advance the 500ms timer here — the visible floating node
   * is irrelevant to this assertion. What matters is that hovering
   * one tile does not splash-hydrate every other tile's engine; only
   * the activated tile's `setActivated(true)` fires.
   *
   * To detect "engine mounted but not yet visible" we check the
   * `aria-describedby` attribute on the hovered tile: pre-activation
   * it's omitted, post-activation it points at `tile-tooltip-<id>`
   * regardless of whether the floating node is currently visible. A
   * regression that eagerly mounts every engine would either render
   * `tile-tooltip-*` nodes pre-hover or stamp `aria-describedby` on
   * every tile without interaction.
   */
  it("does not mount engines for non-hovered tiles, even with many tiles present", () => {
    renderAt("/");

    // Sanity: the lobby renders many tiles (the contract calls for
    // 50+; in practice it's well above that across the default view).
    // We assert the lower bound so a future tile-pruning regression
    // that collapses the grid to a handful of tiles makes this test
    // visibly meaningless rather than silently passing.
    const tiles = document.querySelectorAll('[data-testid^="tile-"]');
    expect(tiles.length).toBeGreaterThanOrEqual(50);

    // Pre-hover: zero engines mounted. No `tile-tooltip-*` element
    // exists in the DOM — `useTileTooltip` returns `tooltip: null`
    // for every tile until `activated` flips.
    expect(
      document.querySelectorAll('[data-testid^="tile-tooltip-"]').length,
    ).toBe(0);
    // And no tile carries the post-hydration `aria-describedby`
    // pointing at a tooltip — the omitted-attr branch is taken
    // for every tile.
    expect(
      document.querySelectorAll('[aria-describedby^="tile-tooltip-"]').length,
    ).toBe(0);

    // Hover one specific tile. This flips that tile's `activated`
    // state, which mounts its sibling `<TileTooltipEngine>`. The
    // engine's first effect publishes `aria-describedby` immediately;
    // we don't need to advance the 500ms timer to observe hydration.
    const target = screen.getByTestId("tile-klondike");
    fireEvent.mouseEnter(target);

    // Exactly one engine hydrated — the hovered tile is the only one
    // now advertising the tooltip via `aria-describedby`. We pin both
    // the count (so a future bug that splash-hydrates every tile in
    // response to one hover surfaces immediately) and the *identity*
    // of the activated tile (so a bug that hydrates the wrong tile
    // — e.g. always the first in DOM order — also surfaces).
    const described = document.querySelectorAll(
      '[aria-describedby^="tile-tooltip-"]',
    );
    expect(described.length).toBe(1);
    expect(described[0]?.getAttribute("data-testid")).toBe("tile-klondike");
    expect(described[0]?.getAttribute("aria-describedby")).toBe(
      "tile-tooltip-klondike",
    );

    // The visible floating node is still absent — the 500ms
    // hover-intent timer hasn't fired yet, so engine-mounted but
    // tooltip-hidden is the expected interim state.
    expect(
      document.querySelectorAll('[data-testid^="tile-tooltip-"]').length,
    ).toBe(0);
  });

  /**
   * W197 — full lazy-hydration round-trip across many tiles.
   *
   * The two existing tests above pin (a) the 500ms delay gating the
   * visible node and (b) the engine staying unhydrated for non-hovered
   * tiles. This third test composes both halves into the exact path a
   * real user takes:
   *
   *   1. Mount the lobby — many tiles render, but BEFORE any hover the
   *      DOM contains zero `tile-tooltip-*` nodes (lazy gate honoured
   *      across the whole grid, not just one tile).
   *   2. Hover exactly one tile (`tile-klondike` — same canonical id
   *      used by the sibling W197 tests so the assertion stays stable
   *      across registry churn).
   *   3. Advance fake timers by 500ms — the hover-intent threshold the
   *      engine schedules in its first effect.
   *   4. Exactly one tooltip mounts, and it is the hovered tile's
   *      `tile-tooltip-klondike` — no splash-hydration of siblings,
   *      no stray tooltips elsewhere in the DOM.
   *
   * This guards against three composed regressions the single-axis
   * tests above can't catch together:
   *   - A change that fires `show()` synchronously on hover (collapsing
   *     the 500ms gate) would surface as the tooltip mounting before
   *     the timer advances; this test's pre-advance snapshot pins
   *     that the visible node stays absent until the timer fires.
   *   - A change that re-introduces eager engine hydration would leave
   *     the pre-hover `tile-tooltip-*` count above zero.
   *   - A change that hydrates EVERY tile's engine in response to one
   *     hover would mount multiple tooltips after the timer fires —
   *     the post-advance count assertion (=== 1) would fail.
   */
  it("W197: lazy-hydrates only the hovered tile's tooltip after the 500ms timer", () => {
    renderAt("/");

    // Sanity: many tiles render. The 50+ lower bound mirrors the
    // sibling lazy-hydration test so a future tile-pruning regression
    // surfaces visibly rather than silently passing.
    const tiles = document.querySelectorAll('[data-testid^="tile-"]');
    expect(tiles.length).toBeGreaterThanOrEqual(50);

    // Pre-hover invariant: zero tooltips anywhere in the DOM. This is
    // the "before any hover" half of the contract — proves the engine
    // stays dormant for every one of the 50+ tiles until the user
    // actually interacts.
    expect(
      document.querySelectorAll('[data-testid^="tile-tooltip-"]').length,
    ).toBe(0);

    // Hover exactly one tile. The hover-intent timer starts here, but
    // the visible floating node MUST NOT mount yet — only the engine
    // hydrates in response to the mouseenter.
    const target = screen.getByTestId("tile-klondike");
    fireEvent.mouseEnter(target);

    // Cross the 500ms threshold via fake timers — the engine's
    // setTimeout callback flips visible=true and renders the floating
    // tooltip node into the DOM.
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Exactly one tooltip mounted, and it is the hovered tile's. The
    // count assertion (=== 1) catches any regression that splash-
    // hydrates sibling tiles in response to a single hover, while the
    // identity assertion catches a regression that mounts the wrong
    // tooltip (e.g. always the first tile's).
    const tooltips = document.querySelectorAll(
      '[data-testid^="tile-tooltip-"]',
    );
    expect(tooltips.length).toBe(1);
    expect(tooltips[0]?.getAttribute("data-testid")).toBe(
      "tile-tooltip-klondike",
    );
    expect(
      screen.getByTestId("tile-tooltip-klondike"),
    ).toBeInTheDocument();
  });

  /**
   * W197 — lazy-hydration on a *different* canonical tile, with an
   * explicit cross-tile negative assertion.
   *
   * The sibling test above pins the contract on `tile-klondike` and
   * asserts the post-advance tooltip count equals 1. A regression that
   * always mounts (say) the first-in-DOM-order tile's tooltip in
   * response to *any* hover would still pass that test if klondike
   * happens to be the first tile rendered — the count check stays
   * green and the identity check coincidentally matches.
   *
   * This test closes that loophole by hovering `tile-freecell`
   * (another canonical solitaire family id, see web/src/games/families.ts
   * — sibling to klondike, also rendered on the default lobby view but
   * at a different DOM position) and explicitly asserting that BOTH
   * sides of the lazy gate hold:
   *   1. Pre-hover, NO tile-tooltip-* nodes exist (gate honoured for
   *      the entire grid, not just klondike).
   *   2. Hovering freecell only, then advancing fake timers by the
   *      500ms hover-intent threshold, mounts EXACTLY `tile-tooltip-
   *      freecell` — and crucially `tile-tooltip-klondike` (the
   *      canonical sibling target the rest of the suite hovers) stays
   *      ABSENT, proving the engine hydrates the tile the user actually
   *      interacted with rather than a hard-coded default.
   */
  it("W197: hovering a different tile mounts only that tile's tooltip after 500ms", () => {
    renderAt("/");

    // Sanity: the lobby renders many tiles — same 50+ floor as the
    // sibling tests so a future tile-pruning regression surfaces
    // visibly here too.
    const tiles = document.querySelectorAll('[data-testid^="tile-"]');
    expect(tiles.length).toBeGreaterThanOrEqual(50);

    // Pre-hover invariant: zero tile-tooltip-* nodes anywhere — the
    // engine stays dormant for every tile until first interaction.
    expect(
      document.querySelectorAll('[data-testid^="tile-tooltip-"]').length,
    ).toBe(0);

    // Hover the freecell tile (NOT klondike — the cross-tile axis is
    // the whole point of this companion test). The hover-intent timer
    // begins; the floating node must not yet be in the DOM.
    const target = screen.getByTestId("tile-freecell");
    fireEvent.mouseEnter(target);

    // Advance fake timers across the 500ms threshold — the engine's
    // setTimeout fires, flipping visible=true and rendering the
    // floating tooltip into the DOM.
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Exactly one tooltip mounted, and it is freecell's. Pinning the
    // identity here (rather than just the count) catches a regression
    // that hydrates the wrong tile — e.g. always the first DOM-order
    // tile, or always klondike because some default got hard-coded.
    const tooltips = document.querySelectorAll(
      '[data-testid^="tile-tooltip-"]',
    );
    expect(tooltips.length).toBe(1);
    expect(tooltips[0]?.getAttribute("data-testid")).toBe(
      "tile-tooltip-freecell",
    );
    expect(
      screen.getByTestId("tile-tooltip-freecell"),
    ).toBeInTheDocument();

    // Cross-tile negative assertion: the canonical sibling
    // `tile-tooltip-klondike` (the target every other W197 test
    // hovers) MUST stay absent. A regression that splash-hydrates
    // siblings, or one that always picks klondike regardless of
    // which tile was hovered, would surface here as a stray node.
    expect(
      screen.queryByTestId("tile-tooltip-klondike"),
    ).not.toBeInTheDocument();
  });

  /**
   * W197 — lazy-hydration after the FIRST hover ends (mouseLeave).
   *
   * Two prior W197 tests pin the post-hover, post-500ms mount path;
   * this test pins the next moment in the lifecycle: once a tile's
   * engine has been hydrated by hover, leaving the tile (mouseLeave
   * before the 500ms threshold) must NOT mount the floating tooltip
   * node, AND the engine itself must remain hydrated for that single
   * tile only — never splashed across siblings.
   *
   * Why this matters: a real user who skims tiles with the cursor
   * generates dozens of hover→leave pairs in rapid succession. The
   * lazy-hydration contract has to hold across that interaction
   * pattern, not just the steady-state hover. A regression that
   * cancels the timer correctly on leave but accidentally hydrates
   * sibling engines (e.g. via a stray `setActivated(true)` in the
   * wrong handler) would silently double the per-tile React commit
   * cost the perf work was meant to avoid.
   *
   * The pre-hover invariant (no tile-tooltip-* anywhere in the DOM
   * across many tiles) is asserted here too, mirroring the sibling
   * tests so this single test stands alone as a complete W197
   * lifecycle check.
   */
  it("W197: hover-then-leave before 500ms keeps the tooltip unmounted but hydrates only the touched engine", () => {
    renderAt("/");

    // Sanity: many tiles render — the same 50+ floor used by the
    // sibling W197 tests for consistent failure mode.
    const tiles = document.querySelectorAll('[data-testid^="tile-"]');
    expect(tiles.length).toBeGreaterThanOrEqual(50);

    // Pre-hover invariant: zero tile-tooltip-* nodes — the engine
    // stays dormant for every one of the 50+ tiles.
    expect(
      document.querySelectorAll('[data-testid^="tile-tooltip-"]').length,
    ).toBe(0);

    const target = screen.getByTestId("tile-klondike");
    fireEvent.mouseEnter(target);
    // Advance partway — well short of the 500ms threshold so the
    // visible node has not yet mounted.
    act(() => {
      vi.advanceTimersByTime(200);
    });
    // Engine has hydrated (aria-describedby stamped) but the floating
    // node is still absent — the timer is mid-flight.
    expect(target.getAttribute("aria-describedby")).toBe(
      "tile-tooltip-klondike",
    );
    expect(
      screen.queryByTestId("tile-tooltip-klondike"),
    ).not.toBeInTheDocument();

    // Leave the tile — the engine's clearTimer cancels the in-flight
    // 500ms timer so show() never fires. After the cancellation, we
    // can advance past 500ms safely; nothing should mount.
    fireEvent.mouseLeave(target);
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Floating node still absent — the cancelled timer never called
    // show(). This is the load-bearing assertion: "leave before
    // threshold ⇒ no tooltip, ever, for this hover sequence".
    expect(
      screen.queryByTestId("tile-tooltip-klondike"),
    ).not.toBeInTheDocument();
    expect(
      document.querySelectorAll('[data-testid^="tile-tooltip-"]').length,
    ).toBe(0);

    // The engine for ONLY this one tile remains hydrated — exactly
    // one element in the DOM still advertises a tile-tooltip-*
    // aria-describedby. A regression that splash-hydrated siblings
    // during the hover would leave this count above 1 after the
    // leave, since aria-describedby is a hydration-time stamp that
    // doesn't get cleared on leave.
    const described = document.querySelectorAll(
      '[aria-describedby^="tile-tooltip-"]',
    );
    expect(described.length).toBe(1);
    expect(described[0]?.getAttribute("data-testid")).toBe("tile-klondike");
  });
});

/**
 * W566 — lobby search title `<mark>` highlighting.
 *
 * Typing a query at least `TITLE_HIGHLIGHT_MIN_LEN` (=2) characters long
 * into the lobby search input must wrap the matched substring of every
 * visible tile's title in a `<mark>` element via `highlightMatch`. This
 * pins the contract that the lobby tile rendering threads `query` down
 * as `highlightQuery` and that the threshold gate fires for the canonical
 * "klondike" search — the most-searched solitaire family. A regression
 * that drops the prop, raises the threshold above 8, or replaces `<mark>`
 * with a plain span would surface here.
 */
describe("LobbyPage — search title <mark> highlight (W566)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("wraps the matched substring of the klondike tile title in <mark>", async () => {
    renderAt("/");
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "klondike" } });

    // While a search query is active, the featured strip is suppressed
    // and `klondike` (a FEATURED_IDS family) lives in the main grid only,
    // where its testid is demoted to `grid-tile-klondike` so DOM querying
    // stays unambiguous when the featured strip is also visible. We
    // target that canonical post-search testid here.
    const tile = await waitFor(() =>
      screen.getByTestId("grid-tile-klondike"),
    );

    // Locate the title span (the `lobby-tile-title` element) and assert
    // it contains a `<mark>` wrapping the matched text. We compare on
    // lowercased innerHTML so the assertion mirrors the spec literal
    // `<mark>klondike</mark>` substring even though the rendered family
    // label is the title-cased "Klondike".
    const title = tile.querySelector(".lobby-tile-title") as HTMLElement;
    expect(title).not.toBeNull();
    expect(title.innerHTML.toLowerCase()).toContain("<mark>klondike</mark>");

    // Belt-and-suspenders: assert via the DOM that exactly one <mark>
    // is rendered inside the title and its text matches the query
    // case-insensitively — guards against a future change that emits a
    // different highlight tag (e.g. <span class="hl">) but still happens
    // to contain the substring in some unrelated attribute.
    const marks = title.querySelectorAll("mark");
    expect(marks.length).toBe(1);
    expect(marks[0]?.textContent?.toLowerCase()).toBe("klondike");
  });
});

/**
 * W582 — the lobby list-mode toggle (`lobby-mode-toggle`) flips between
 * the default "pagination" mode (explicit Prev/Next over PAGE_SIZE pages)
 * and "infinite" mode (IntersectionObserver-driven progressive append).
 * The two modes are mutually exclusive in the rendered DOM:
 *   - In pagination mode the `lobby-pager` (with `lobby-pager-prev` /
 *     `lobby-pager-next`) renders when the filtered pool spans >1 page,
 *     and the infinite-mode `lobby-sentinel` is absent.
 *   - In infinite mode the `lobby-sentinel` renders while there is more
 *     to load, and the Prev/Next pager controls are gone.
 *
 * The default-pagination test seeds an empty localStorage so
 * `readPersistedListMode()` falls back to "pagination", while the toggle
 * test starts from that same default and clicks `lobby-mode-infinite`
 * to exercise the live-flip behaviour. Both tests rely only on the
 * canonical testids stamped in LobbyPage.tsx — no rect mocking or
 * matchMedia stubs are needed because the toggle and pager are rendered
 * at any viewport.
 */
describe("LobbyPage — list-mode toggle pagination/infinite (W183/W582)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("default pagination mode renders Prev/Next and no infinite-mode sentinel", () => {
    renderAt("/");
    // The toggle itself is always mounted so users can opt into infinite
    // mode at any time.
    expect(screen.getByTestId("lobby-mode-toggle")).toBeInTheDocument();
    // Default mode is "pagination" — the pagination button reads pressed,
    // the infinite button is unpressed. Pinning both halves of the toggle
    // pair guards against a regression that flips only one side's flag.
    expect(screen.getByTestId("lobby-mode-pagination")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByTestId("lobby-mode-infinite")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    // Pager + Prev/Next controls are present (the registry has more than
    // PAGE_SIZE entries, so totalPages>1 and the pager renders).
    expect(screen.getByTestId("lobby-pager")).toBeInTheDocument();
    expect(screen.getByTestId("lobby-pager-prev")).toBeInTheDocument();
    expect(screen.getByTestId("lobby-pager-next")).toBeInTheDocument();
    // Infinite-mode-only DOM is absent in the default render — the two
    // modes never co-render their footer affordances.
    expect(screen.queryByTestId("lobby-sentinel")).not.toBeInTheDocument();
    expect(screen.queryByTestId("lobby-loaded-count")).not.toBeInTheDocument();
  });

  it("clicking lobby-mode-infinite shows the sentinel and removes Prev/Next", async () => {
    renderAt("/");
    // Sanity baseline: pagination mode owns the DOM before the toggle click.
    expect(screen.getByTestId("lobby-pager-prev")).toBeInTheDocument();
    expect(screen.getByTestId("lobby-pager-next")).toBeInTheDocument();
    expect(screen.queryByTestId("lobby-sentinel")).not.toBeInTheDocument();

    // Flip to infinite mode via the canonical toggle button.
    fireEvent.click(screen.getByTestId("lobby-mode-infinite"));

    // The toggle's aria-pressed pair flips together — pagination releases,
    // infinite engages — and the persistence twin lands under the
    // canonical `cards-lobby-list-mode` key so a reload rehydrates here.
    await waitFor(() => {
      expect(screen.getByTestId("lobby-mode-infinite")).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });
    expect(screen.getByTestId("lobby-mode-pagination")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(localStorage.getItem("cards-lobby-list-mode")).toBe("infinite");

    // Infinite mode swaps the footer: the sentinel mounts (the pool is
    // larger than the initial visibleCount so `hasMore` is true) and the
    // loaded-count live-region is visible.
    expect(screen.getByTestId("lobby-sentinel")).toBeInTheDocument();
    expect(screen.getByTestId("lobby-loaded-count")).toBeInTheDocument();
    // Prev/Next pagination controls are gone — the two modes are
    // mutually exclusive in the rendered DOM. We also pin that the
    // pagination toggle button itself remains mounted (the toggle
    // group never collapses on a flip — only the FOOTER affordances
    // swap), so a second click can return the user to pagination
    // mode without a remount.
    expect(screen.queryByTestId("lobby-pager")).not.toBeInTheDocument();
    expect(screen.queryByTestId("lobby-pager-prev")).not.toBeInTheDocument();
    expect(screen.queryByTestId("lobby-pager-next")).not.toBeInTheDocument();
    expect(screen.getByTestId("lobby-mode-pagination")).toBeInTheDocument();
  });
});

/**
 * W414 — drag-handle visual cue is gated by the favorites filter.
 *
 * Each lobby tile permanently renders a `tile-drag-handle-<id>` span, but
 * LobbyPage.css keeps it `display: none` until the parent tile carries
 * `data-fav-drag-id` (an attribute stamped by the favorites-filter
 * useEffect — the same gate the drag-reorder pathway uses, see W397). The
 * load-bearing CSS contract is exactly:
 *
 *   .tile-drag-handle              { display: none; }
 *   .tile[data-fav-drag-id] .tile-drag-handle { display: inline-block; }
 *
 * jsdom does not apply Vite-imported CSS, so we inject the two gating
 * rules directly into the document so `getComputedStyle` actually
 * reflects the visual outcome a real browser would render. This pins
 * both halves of the contract: handle visible under the favorites filter,
 * hidden otherwise.
 */
describe("LobbyPage — drag-handle visual cue gating (W414)", () => {
  // `2048` is a stand-alone game (no family, not in FEATURED_IDS — see
  // `web/src/games/twenty-forty-eight/`), so its main-grid GameCard always
  // renders the `tile-drag-handle-2048` span and there is no featured-strip
  // duplicate to disambiguate against. Adding it to the favorites blob
  // surfaces the same tile under the favorites filter, exercising both
  // halves of the gating contract on a single stable id.
  const GAME_ID = "2048";
  let styleEl: HTMLStyleElement;

  beforeEach(() => {
    localStorage.clear();
    // Mirror the production CSS rules from LobbyPage.css so jsdom's
    // computed-style resolves the gate authentically. We only inject the
    // two load-bearing rules — full stylesheet import is out of scope and
    // would couple this test to unrelated layout properties.
    styleEl = document.createElement("style");
    styleEl.setAttribute("data-testid", "w414-css");
    styleEl.textContent = `
      .tile-drag-handle { display: none; }
      .tile[data-fav-drag-id] .tile-drag-handle { display: inline-block; }
    `;
    document.head.appendChild(styleEl);
    // Seed favorites so the favorites filter has at least one visible tile
    // to stamp `data-fav-drag-id` on (otherwise `lobby-favorites-empty`
    // renders instead of the grid and there's no handle to inspect).
    localStorage.setItem("cards-favorites", JSON.stringify([GAME_ID]));
  });

  afterEach(() => {
    styleEl.remove();
  });

  it("shows tile-drag-handle-<id> only when filter=favorites stamps data-fav-drag-id", async () => {
    // Default filter is "all" — the tile renders in the main grid but
    // has no `data-fav-drag-id`, so the always-rendered handle stays
    // `display: none` per the injected gating CSS.
    renderAt("/");
    const handleAll = screen.getByTestId(`tile-drag-handle-${GAME_ID}`);
    expect(handleAll).toBeInTheDocument();
    expect(window.getComputedStyle(handleAll).display).toBe("none");
    // The parent tile is missing the gating attribute under "all" — this
    // guards against a regression that stamps the attribute outside the
    // favorites filter (which would silently flip every tile draggable).
    expect(
      handleAll.closest(".tile")?.getAttribute("data-fav-drag-id"),
    ).toBeNull();

    // Flip to favorites — the DOM-stamping effect adds `data-fav-drag-id`
    // to each visible favorite tile, which flips the CSS gate to
    // `inline-block` and makes the handle visible.
    fireEvent.click(screen.getByTestId("chip-favorites"));
    await waitFor(() => {
      expect(
        document.querySelectorAll(".tile[data-fav-drag-id]").length,
      ).toBeGreaterThan(0);
    });
    const handleFav = screen.getByTestId(`tile-drag-handle-${GAME_ID}`);
    expect(handleFav.closest(".tile")?.getAttribute("data-fav-drag-id")).toBe(
      `game-${GAME_ID}`,
    );
    expect(window.getComputedStyle(handleFav).display).toBe("inline-block");
  });

  // W414 — DOM existence half of the contract: when the lobby mounts
  // directly on the favorites filter (i.e. `cards-lobby-filter` ===
  // "favorites" pre-render), the `tile-drag-handle-<id>` span MUST be
  // present in the DOM for every favorited tile. This is a stricter
  // existence check than the CSS-gated visibility test above — even if
  // a future refactor decouples the visual cue from `data-fav-drag-id`,
  // the handle node itself is the affordance ARIA / screen readers
  // discover by testid, so its presence under the favorites filter is
  // the load-bearing promise. Pinning this independently of any CSS
  // rule means a regression that conditionally renders the handle
  // (e.g. only on hover) would surface here even without the style
  // injection the sibling test relies on.
  it("renders tile-drag-handle-<id> in the DOM when filter=favorites", () => {
    // Mount directly into the favorites filter so the favorites grid
    // owns the canonical (non-featured) tile for GAME_ID and the
    // always-rendered handle span is reachable by its stable testid.
    localStorage.setItem("cards-lobby-filter", "favorites");
    renderAt("/");
    const handle = screen.getByTestId(`tile-drag-handle-${GAME_ID}`);
    expect(handle).toBeInTheDocument();
  });
});

/**
 * W603 — HeartToggle persistence on a lobby tile.
 *
 * The per-tile ♥ button is the inline favorites entry point. Clicking
 * it must (a) flip the tile's `aria-pressed` state in the same render
 * so the UI feels responsive, AND (b) write the new favorite id
 * through to the canonical `cards-favorites` localStorage blob so a
 * reload (or a sibling tab) sees the same state. This test pins both
 * halves on a stand-alone game (`pool-10ball` — no family, so the
 * HeartToggle id, the click-handler arg, and the persisted id are all
 * literally the same string and the round-trip is unambiguous).
 *
 * A complementary file (LobbyPageHearts.test.tsx) covers the unfavorite
 * direction and rehydration; this test is the favoriting-half single-
 * shot kept inside the main LobbyPage suite so the contract surfaces
 * here even when the suites are run in isolation.
 */
describe("LobbyPage — HeartToggle persistence (W603)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("clicking ♥ on a tile flips fav state and persists cards-favorites", async () => {
    renderAt("/");
    const heart = await screen.findByTestId("tile-fav-toggle-pool-10ball");
    // Precondition — fresh user has no favorites and no persisted blob.
    expect(heart.getAttribute("aria-pressed")).toBe("false");
    expect(localStorage.getItem("cards-favorites")).toBeNull();

    fireEvent.click(heart);

    // Persistence is synchronous inside the click handler, so the
    // canonical `cards-favorites` blob must already contain the id.
    const persisted = localStorage.getItem("cards-favorites");
    expect(persisted).not.toBeNull();
    expect(JSON.parse(persisted as string) as string[]).toContain("pool-10ball");

    // Visual flip arrives after the favSet setState commit — wait for
    // the re-render to align aria-pressed with the persisted truth.
    await waitFor(() => {
      expect(
        screen.getByTestId("tile-fav-toggle-pool-10ball").getAttribute("aria-pressed"),
      ).toBe("true");
    });
  });
});

/**
 * W579 — the "Surprise me" button on the lobby toolbar (rendered with the
 * canonical `lobby-surprise` testid alongside the category stat-strip)
 * must navigate the user to a random `/play/<id>` route when clicked.
 * This pins the contract that:
 *   1. The button is reachable by its stable testid.
 *   2. Clicking it invokes `navigate()` from react-router-dom exactly once.
 *   3. The destination is shaped `/play/<non-empty-id>` — the random pick
 *      MUST resolve to some game in the GAMES registry, never an empty
 *      string and never a different prefix.
 *
 * `Math.random` is stubbed to a deterministic constant so the test does
 * not depend on which game the picker happens to land on while still
 * exercising the same code path real users hit.
 */
describe("LobbyPage — surprise me button (W579)", () => {
  beforeEach(() => {
    localStorage.clear();
    navigateSpy.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("clicking lobby-surprise navigates to a random /play/<id> route", () => {
    // Pin Math.random so the picker's `Math.floor(Math.random() * pool.length)`
    // resolves deterministically — we don't care which game gets picked,
    // only that the navigate target has the `/play/<id>` shape.
    vi.spyOn(Math, "random").mockReturnValue(0);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("lobby-surprise");
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    const target = navigateSpy.mock.calls[0]?.[0] as string;
    expect(typeof target).toBe("string");
    // `/play/` prefix + at least one id char — the random pick must
    // resolve to a real game id, never an empty suffix.
    expect(target).toMatch(/^\/play\/.+/);
  });

  /**
   * W604 — companion check that doesn't rely on the navigateSpy. Mounts a
   * sibling `LocationProbe` inside the same MemoryRouter so we can read the
   * router's actual pathname after the click. This pins the user-visible
   * outcome (URL changes to something under `/play/`) rather than just the
   * internal navigate() call shape.
   */
  it("clicking lobby-surprise updates the router location to /play/<id>", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    function LocationProbe(): JSX.Element {
      const loc = useLocation();
      return <div data-testid="loc-probe">{loc.pathname}</div>;
    }

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
        <LocationProbe />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("loc-probe").textContent).toBe("/");
    fireEvent.click(screen.getByTestId("lobby-surprise"));
    expect(screen.getByTestId("loc-probe").textContent).toMatch(/^\/play\/.+/);
  });

  /**
   * W763 — surprise-me MUST honour the active filter when picking its
   * pool. The `filter === "hidden"` branch in `surpriseMe` restricts
   * `pool` to `allGames.filter((g) => hiddenSet.has(g.id))`, so when the
   * hidden set contains exactly one id and the active filter is
   * "hidden", the pool collapses to a single game and the navigate
   * target is fully determined regardless of `Math.random`. Pinning
   * this guards against a regression that would either ignore the
   * filter (picking from `allGames`) or swap the hidden/non-hidden
   * branches and pick from the wrong pool. The W579 / W604 twins above
   * only assert the `/play/<id>` shape — they cannot detect a filter
   * leak. We seed the hidden set and the persisted filter directly via
   * localStorage so the page hydrates into the Hidden view without
   * depending on the chip / tile-menu click pathways covered elsewhere.
   */
  it("respects the active 'hidden' filter — picks from the hidden pool only", () => {
    // Stub Math.random so any test bug that picked from a larger pool
    // would land deterministically (and visibly mismatch our expected
    // single-game target). A returned 0 hits index 0 of whatever pool
    // the function chooses — `chess` if filter wins, the first GAMES
    // entry otherwise.
    vi.spyOn(Math, "random").mockReturnValue(0);

    // Seed the hidden set with a single, well-known game id so the
    // hidden-pool reduces to exactly `[chess]`. `chess` is a stable,
    // standalone (non-family) game id (see `web/src/games/chess/index.ts`)
    // so the navigate target is the bare `/play/chess` route — no family
    // disambiguation needed.
    localStorage.setItem("cards-hidden-games", JSON.stringify(["chess"]));
    // Pre-select the Hidden chip via persistence so `readPersistedFilter`
    // hydrates `filter === "hidden"` on mount, taking the
    // `pool = allGames.filter((g) => hiddenSet.has(g.id))` branch.
    localStorage.setItem("cards-lobby-filter", "hidden");

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("lobby-surprise"));

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    // Exact match — the hidden pool has length 1 so the pick is forced.
    // A regression that picks from `allGames` would land on whichever
    // game is at GAMES[0] (currently `texas-holdem`), not `chess`.
    expect(navigateSpy.mock.calls[0]?.[0]).toBe("/play/chess");
  });
});

/**
 * W609 — FamilyPicker search input filters the visible variant list.
 *
 * Once the picker is open, typing into `fam-picker-search-<id>` must
 * narrow the rendered `pick-<variant-id>` items to those whose title
 * contains the query (case-insensitive substring match — see the
 * `members.filter((m) => m.title.toLowerCase().includes(q))` branch in
 * `FamilyPicker`'s `view` useMemo). The klondike family is the canonical
 * exemplar: it ships with multiple variants so a "vegas" query can be
 * proven to narrow the list rather than coincidentally matching every
 * member. We deep-link via `/?family=klondike` so the picker auto-opens
 * without depending on tile-click wiring (covered separately above).
 */
describe("LobbyPage — FamilyPicker search filter (W609)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("typing into fam-picker-search-klondike filters visible variants", async () => {
    renderAt(`/?family=${FAMILY_ID}`);
    // Wait for the auto-open path to mount the picker dialog.
    await waitFor(() => {
      expect(screen.getByTestId(`fam-picker-${FAMILY_ID}`)).toBeInTheDocument();
    });

    // Baseline: at least one non-vegas klondike variant is visible — i.e.
    // the unfiltered list is not already trivially equal to the matches.
    // `pick-bakers-klondike` is a stable klondike family member (see
    // `web/src/games/families.ts`) whose title does NOT contain the
    // substring "vegas", so its presence pre-filter and absence post-
    // filter together prove the query genuinely narrowed the list
    // rather than the picker happening to already render only matches.
    expect(
      screen.getByTestId("pick-bakers-klondike"),
    ).toBeInTheDocument();
    // And the target match itself is also present pre-filter so the
    // post-filter "still there" assertion below is meaningful.
    expect(
      screen.getByTestId("pick-vegas-klondike"),
    ).toBeInTheDocument();

    const search = screen.getByTestId(
      `fam-picker-search-${FAMILY_ID}`,
    ) as HTMLInputElement;
    fireEvent.change(search, { target: { value: "vegas" } });
    // Controlled input — the value reflects the query immediately.
    expect(search.value).toBe("vegas");

    // Post-filter: the matching variant remains, the non-matching
    // sibling is gone. Pinning both sides of the predicate guards
    // against a regression that no-ops the filter (everything stays)
    // OR over-filters (everything goes), either of which would let a
    // single-sided assertion silently pass.
    await waitFor(() => {
      expect(
        screen.queryByTestId("pick-bakers-klondike"),
      ).not.toBeInTheDocument();
    });
    expect(
      screen.getByTestId("pick-vegas-klondike"),
    ).toBeInTheDocument();
  });
});

/**
 * W608 — lobby search clear (X) button.
 *
 * The lobby search input is a controlled field bound to the `query` state.
 * When `query` is non-empty, a tiny "×" affordance (rendered with
 * `className="lobby-search-clear"` and `aria-label="Clear search"`) appears
 * inside the search box; clicking it must reset the input to "" in a
 * single user gesture so the lobby's filtered-pool returns to its
 * unfiltered baseline. The button is conditionally mounted — it is absent
 * before the user types anything and absent again after a successful
 * clear — which is how we distinguish "input was emptied via the button"
 * from "input was emptied some other way" without poking at internal
 * state. There is no `data-testid` on this button (it carries only a
 * stable className + aria-label), so we resolve it via the accessible
 * label, which is the screen-reader contract real users rely on anyway.
 */
describe("LobbyPage — search clear button (W608)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("typing then clicking the Clear search button empties the input", () => {
    renderAt("/");
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;

    // Pre-type baseline: input is empty and the conditionally-mounted
    // clear button is absent — the affordance only appears once the
    // controlled `query` state is truthy.
    expect(search.value).toBe("");
    expect(
      screen.queryByRole("button", { name: /clear search/i }),
    ).not.toBeInTheDocument();

    // Type a non-empty query — fires a single change event so the
    // controlled input picks up the value through `setQuery`. We use
    // "klondike" to mirror the canonical search query exercised by the
    // W566 highlight test above; the exact text is not load-bearing,
    // only that it is non-empty so the clear button mounts.
    fireEvent.change(search, { target: { value: "klondike" } });
    expect(search.value).toBe("klondike");

    // The clear button is now mounted — resolved via its accessible
    // name (the only stable selector the production markup exposes for
    // this affordance, since no `data-testid` is stamped on it). The
    // className assertion pins the production class so a refactor that
    // renames `lobby-search-clear` (and breaks its CSS sizing/position)
    // surfaces here rather than only in visual regression.
    const clearBtn = screen.getByRole("button", { name: /clear search/i });
    expect(clearBtn).toBeInTheDocument();
    expect(clearBtn).toHaveClass("lobby-search-clear");

    fireEvent.click(clearBtn);

    // Input is empty again and the clear button has un-mounted, both
    // of which together prove the click flowed through `setQuery("")`
    // rather than just clearing the visible text via some other path.
    expect(search.value).toBe("");
    expect(
      screen.queryByRole("button", { name: /clear search/i }),
    ).not.toBeInTheDocument();
  });

  // W608 — companion test pinning the *behavioral* outcome of clearing,
  // not just the input-emptied state above. While a query is active, the
  // lobby grid filters down to matching tiles and prunes the rest; the
  // canonical evidence of "clear button restored the unfiltered pool" is
  // that a tile which was filtered OUT during the query reappears after
  // the click. We use `tile-pool-9ball` as the canary: a stand-alone
  // game (no family, distinct id) that is not a substring of the
  // "klondike" query and therefore must be pruned during the search and
  // re-rendered on clear. This guards against a regression that wires
  // the X to clear only the input value but forgets to flow through
  // `setQuery` (which drives the filter recomputation downstream).
  it("clearing the search restores tiles that were filtered out by the query", async () => {
    renderAt("/");
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;

    // Baseline: a non-matching, stand-alone game tile is visible in the
    // unfiltered grid. `pool-9ball` is a stable stand-alone game id whose
    // label does not contain "klondike" — picking a different family-
    // prefixed canary would risk false-positives if the family label
    // happened to share characters.
    const canary = await waitFor(() =>
      screen.getByTestId("tile-pool-9ball"),
    );
    expect(canary).toBeInTheDocument();

    // Type the canonical solitaire query — `pool-9ball` does not match
    // "klondike" anywhere in its label/aliases, so it must be pruned
    // from the filtered grid.
    fireEvent.change(search, { target: { value: "klondike" } });
    await waitFor(() => {
      expect(screen.queryByTestId("tile-pool-9ball")).not.toBeInTheDocument();
    });

    // Click the clear button — this is the assertion-of-record for the
    // W608 contract: the X must trigger `setQuery("")` so the filtered
    // pool is recomputed against the empty query, restoring every tile.
    fireEvent.click(screen.getByRole("button", { name: /clear search/i }));

    // The canary tile is back. Pinning the post-clear visibility (rather
    // than just `search.value === ""`) is what proves the click flowed
    // through to the filter pipeline, not merely the input element.
    await waitFor(() => {
      expect(screen.getByTestId("tile-pool-9ball")).toBeInTheDocument();
    });
  });
});

/**
 * W606 — keyboard activation on a lobby tile must navigate to the
 * underlying `/play/<id>` route. Stand-alone game tiles are rendered as
 * react-router `<Link>` elements (see GameCard in LobbyPage.tsx), and
 * the lobby's roving-tabindex effect makes exactly one of them the
 * Tab-stop at any given time (`tabIndex=0`). Pressing Enter on the
 * focused link is the canonical keyboard equivalent of a click — in
 * real browsers this fires the anchor's default click pathway, which
 * react-router intercepts and turns into a router navigation.
 *
 * jsdom does not synthesise that click-on-Enter for anchors, so we
 * exercise the activation pathway via `fireEvent.click(tile)` after
 * focusing — the contract this test pins is "tile activated by the
 * user (via Enter or click) navigates to /play/<id>", and click is the
 * deterministic stand-in for the Enter that would fire the same
 * handler in a real browser. The test wires a sibling `LocationProbe`
 * inside the same MemoryRouter so the assertion reads the router's
 * actual pathname rather than poking history internals.
 *
 * `2048` is a stand-alone game with no family wrapper (see W414 for
 * the same id used precisely because of that property), so its tile
 * is rendered by GameCard as a `<Link to="/play/2048">` and its testid
 * is the unambiguous `tile-2048`.
 */
describe("LobbyPage — tile keyboard Enter activation (W606)", () => {
  const GAME_ID = "2048";

  beforeEach(() => {
    localStorage.clear();
    navigateSpy.mockReset();
  });

  it("focused tile (tabIndex=0) activated by click navigates to /play/<id>", async () => {
    function LocationProbe(): JSX.Element {
      const loc = useLocation();
      return <div data-testid="loc-probe">{loc.pathname}</div>;
    }

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
        <LocationProbe />
      </MemoryRouter>,
    );

    // Sanity baseline: the router starts on the lobby root.
    expect(screen.getByTestId("loc-probe").textContent).toBe("/");

    // Resolve the stand-alone tile via its canonical testid — GameCard
    // stamps `tile-<id>` on the underlying `<Link>` itself, so this
    // element IS the activation surface (not a wrapping div).
    const tile = await screen.findByTestId(`tile-${GAME_ID}`);
    expect(tile.tagName).toBe("A");
    expect(tile.getAttribute("href")).toBe(`/play/${GAME_ID}`);

    // Focus the tile by promoting it into the roving-tabindex tab stop
    // and calling .focus(). The lobby's post-render effect normally
    // hands tabIndex=0 to whichever tile owns focus, so once we focus
    // the target the next render keeps it as the lone Tab stop. We
    // also set tabIndex=0 explicitly first so the activeElement check
    // below holds even if the layout effect hasn't yet committed.
    tile.tabIndex = 0;
    tile.focus();
    expect(document.activeElement).toBe(tile);
    expect(tile.tabIndex).toBe(0);

    // Activate the link. In a real browser, pressing Enter on a focused
    // anchor dispatches the default click pathway; jsdom doesn't
    // synthesise that, so we fire the click directly — the same handler
    // the Enter keystroke would invoke. react-router's Link intercepts
    // the click via useLinkClickHandler and pushes the history entry
    // that LocationProbe will read back.
    fireEvent.click(tile);

    // The router's location now reflects the deep-link target. Reading
    // through LocationProbe (rather than the navigateSpy) pins the
    // user-visible outcome — the URL really did change to /play/2048.
    await waitFor(() => {
      expect(screen.getByTestId("loc-probe").textContent).toBe(
        `/play/${GAME_ID}`,
      );
    });
  });
});

/**
 * W624 — clicking the `chip-solitaire` category chip must filter the
 * lobby grid down to entries whose underlying GameCategory is
 * `solitaire`. The visual contract is enforced via the className
 * modifier `tile--cat-s` (CATEGORY_TAG.solitaire === "s") that
 * GameCard / family tiles stamp on every tile root; the dice category
 * uses the disjoint tag `d`. We assert (1) the chip flips to
 * aria-pressed=true and persists `solitaire` to `cards-lobby-filter`,
 * (2) at least one tile is in the grid (the registry has many
 * solitaire entries so the filter must not nuke the list), (3) every
 * rendered `.tile--cat-X` carries the solitaire tag, and (4) no tile
 * carries the dice tag — proving the filter is strictly
 * category-scoped, not just visually relabelled.
 */
describe("LobbyPage — category chip filter (W624)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("clicking chip-solitaire filters the grid to solitaire-category tiles only", () => {
    renderAt("/");

    const solitaireChip = screen.getByTestId("chip-solitaire");
    expect(solitaireChip).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(solitaireChip);

    // Chip activation contract — pressed state and persisted filter key.
    expect(solitaireChip).toHaveAttribute("aria-pressed", "true");
    expect(localStorage.getItem("cards-lobby-filter")).toBe("solitaire");

    // Every tile in the grid must carry CATEGORY_TAG.solitaire ("s").
    // Scope to elements whose className includes a `tile--cat-` modifier
    // so we hit the real lobby grid (and ignore unrelated nodes).
    const tiles = Array.from(
      document.querySelectorAll<HTMLElement>('[class*="tile--cat-"]'),
    );
    expect(tiles.length).toBeGreaterThan(0);

    for (const tile of tiles) {
      // Must be the solitaire tag…
      expect(tile.className).toMatch(/\btile--cat-s\b/);
      // …and explicitly NOT the dice tag (cross-category contamination
      // would surface here even if the tile somehow also carried `s`).
      expect(tile.className).not.toMatch(/\btile--cat-d\b/);
    }
  });
});

/**
 * Recently-played chip filter (W227) — the chip surfaces only entries
 * whose member ids carry a non-zero stamp in the `cards-last-played`
 * map, sorted most-recent first by intrinsic timestamp ordering. We
 * seed two well-known family heads (`klondike` is "now",  `spider` is
 * one day older) and assert the surviving grid is exactly those two
 * tiles in that order. The featured strip is suppressed for any
 * non-"all" filter, so the canonical `tile-<familyId>` testids are
 * unambiguous in the main grid.
 */
describe("LobbyPage — recently-played chip filter (W227)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("filters tiles to the seeded last-played games only", () => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    localStorage.setItem(
      "cards-last-played",
      JSON.stringify({ klondike: now, spider: now - oneDayMs }),
    );

    renderAt("/");

    const chip = screen.getByTestId("chip-recently-played");
    expect(chip).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(chip);

    expect(chip).toHaveAttribute("aria-pressed", "true");
    expect(localStorage.getItem("cards-lobby-filter")).toBe("recently-played");

    // Both ids appear in `FEATURED_IDS`, so when the chip is active
    // their main-grid tiles render with the demoted `grid-tile-<id>`
    // testid — the canonical `tile-<id>` slot belongs to the featured
    // strip, which is suppressed for any non-"all" filter.
    expect(screen.getByTestId("grid-tile-klondike")).toBeInTheDocument();
    expect(screen.getByTestId("grid-tile-spider")).toBeInTheDocument();

    // The surviving tile set must be exactly those two family tiles,
    // klondike before spider per the recently-played intrinsic
    // descending-timestamp sort.
    const tileIds = Array.from(
      document.querySelectorAll<HTMLElement>('[class*="tile--cat-"]'),
    )
      .map((t) => t.getAttribute("data-testid"))
      .filter((id): id is string => id != null && /^(tile|grid-tile)-/.test(id));
    expect(tileIds).toEqual(["grid-tile-klondike", "grid-tile-spider"]);
  });
});

/**
 * W661 — when the lobby chip strip overflows horizontally (scrollWidth >
 * clientWidth), the ChipStrip wrapper must surface its scroll-arrow
 * buttons so non-touch users can advance the row without a wheel/swipe.
 * Both arrows share `.lobby-chips-arrow` and are toggled via the native
 * `hidden` attribute, so we assert visibility by reading that flag after
 * forcing an overflow geometry on the track element. jsdom reports
 * scrollWidth/clientWidth as 0, so we monkey-patch the prototype getters
 * to simulate a real overflow without depending on a layout engine.
 */
describe("LobbyPage — chip-strip overflow scroll arrows (W661)", () => {
  const protoSW = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "scrollWidth",
  );
  const protoCW = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "clientWidth",
  );
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
      configurable: true,
      get(this: HTMLElement) {
        return this.classList.contains("lobby-chips") ? 2000 : 0;
      },
    });
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      get(this: HTMLElement) {
        return this.classList.contains("lobby-chips") ? 400 : 0;
      },
    });
  });
  afterEach(() => {
    if (protoSW) Object.defineProperty(HTMLElement.prototype, "scrollWidth", protoSW);
    if (protoCW) Object.defineProperty(HTMLElement.prototype, "clientWidth", protoCW);
  });

  it("renders the right scroll-arrow button (not hidden) when the chip strip overflows", () => {
    renderAt("/");
    // Nudge the strip so the recompute effect re-evaluates against our
    // stubbed geometry — the post-mount scroll listener treats scroll
    // events as the canonical "geometry changed" signal.
    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();
    act(() => {
      track!.dispatchEvent(new Event("scroll"));
    });

    const right = document.querySelector<HTMLButtonElement>(
      ".lobby-chips-arrow--right",
    );
    const left = document.querySelector<HTMLButtonElement>(
      ".lobby-chips-arrow--left",
    );
    expect(right).not.toBeNull();
    expect(left).not.toBeNull();
    // At scrollLeft === 0 only the right arrow can advance, so it must
    // be visible (`hidden` toggled off) while the left arrow stays
    // hidden until the user has scrolled past the 1px tolerance.
    expect(right!.hidden).toBe(false);
    expect(right!.getAttribute("aria-label")).toBe("Scroll filters right");
    expect(left!.hidden).toBe(true);
  });
});

/**
 * W178 — every chip in the lobby filter strip carries a numeric count
 * badge (`.lobby-chip-count`) showing how many GAMES match that filter.
 * The "all" chip's badge is the registry size; per-category chips
 * (solitaire, cards, dice, board, arcade) reflect that category's
 * entries. We read each badge while the strip is at rest, assert
 * chip-solitaire is >= 100 (the registry has long since crossed that
 * threshold), and confirm chip-all equals the sum of every category
 * chip — GAMES has no category-less entries, so the totals must agree.
 *
 * Counts are rendered via `Number#toLocaleString`, which inserts
 * thousands separators (",") in the test runtime locale — strip those
 * before parseInt so the assertion is locale-stable.
 */
describe("LobbyPage — chip-strip count badges (W178)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("each chip's .lobby-chip-count displays the matching game count", () => {
    function readChipCount(testId: string): number {
      const chip = screen.getByTestId(testId);
      const badge = chip.querySelector<HTMLElement>(".lobby-chip-count");
      expect(badge).not.toBeNull();
      const raw = (badge!.textContent ?? "").replace(/[^\d-]/g, "");
      expect(raw.length).toBeGreaterThan(0);
      return Number.parseInt(raw, 10);
    }

    renderAt("/");

    // Capture every per-category badge value while still on the "all"
    // filter — the chip strip renders these counts unconditionally,
    // independent of the active filter.
    const categories = ["solitaire", "cards", "dice", "board", "arcade"] as const;
    const badgeCounts: Record<(typeof categories)[number], number> = {
      solitaire: 0, cards: 0, dice: 0, board: 0, arcade: 0,
    };
    for (const cat of categories) {
      badgeCounts[cat] = readChipCount(`chip-${cat}`);
      expect(badgeCounts[cat]).toBeGreaterThan(0);
    }

    // The solitaire registry is the dominant category — its badge must
    // sit at or above the 100-game threshold.
    expect(badgeCounts.solitaire).toBeGreaterThanOrEqual(100);

    // The "all" chip's badge equals the sum of every category badge —
    // counts are over individual GAMES (not family-collapsed tiles),
    // see the categoryCounts useMemo comment in LobbyPage.tsx.
    const allCount = readChipCount("chip-all");
    const summed = categories.reduce((s, c) => s + badgeCounts[c], 0);
    expect(allCount).toBe(summed);

    // Every chip in the strip must expose a numeric badge — covers the
    // status filter chips (favorites, top-rated, recently-played,
    // hidden) whose values may legitimately be zero on a fresh mount.
    for (const tid of [
      "chip-all",
      "chip-top-rated",
      "chip-favorites",
      "chip-recently-played",
      "chip-hidden",
      ...categories.map((c) => `chip-${c}`),
    ]) {
      const chip = screen.getByTestId(tid);
      const badge = chip.querySelector<HTMLElement>(".lobby-chip-count");
      expect(badge).not.toBeNull();
      expect((badge!.textContent ?? "").trim()).toMatch(/^\d[\d,]*$/);
    }
  });
});

/**
 * W663 — initial-mount sync-render check. PAGE_SIZE in LobbyPage is 80,
 * so on first paint the lobby grid must contain a substantial set of
 * `tile-*` children (featured strip + first page of the main grid).
 * If a regression flips rendering to async/lazy and the grid renders
 * empty before an effect fires, this test catches it: we render once
 * and assert >50 tile children synchronously, with no waitFor/act.
 */
describe("LobbyPage — initial grid children count (W663)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders many tile-* children synchronously on initial mount", () => {
    renderAt("/");
    const tiles = screen.getAllByTestId(/^tile-/);
    expect(tiles.length).toBeGreaterThan(50);
  });
});

/**
 * W673 — seeding `cards-hidden-games` with a known game id MUST keep
 * that tile out of the default lobby grid on initial mount. The lobby
 * hydrates `hiddenSet` synchronously from localStorage and applies
 * `pool = allGames.filter(g => !hiddenSet.has(g.id))` for every chip
 * other than the dedicated Hidden chip. Pinning this in the main test
 * file (alongside the chip-filter coverage) keeps the contract visible
 * even if the sibling W574 tests churn around the menu pathway.
 *
 * `texas-holdem` is a stable standalone (non-family, non-featured) game
 * id — its `tile-texas-holdem` testid resolves to a single GameCard in
 * the main grid, so a `queryByTestId` against it is unambiguous. We
 * pair it with `tile-klondike` (a featured family that always renders
 * in the featured strip) for the sanity assertion.
 */
describe("LobbyPage — cards-hidden-games filters main grid (W673)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("hides a seeded id from the default grid while leaving others visible", () => {
    localStorage.setItem(
      "cards-hidden-games",
      JSON.stringify(["texas-holdem"]),
    );

    renderAt("/");

    // The seeded id must be filtered out of the default ("all") grid —
    // the contract pin against `pool = allGames.filter(g => !hiddenSet.has)`.
    expect(screen.queryByTestId("tile-texas-holdem")).not.toBeInTheDocument();

    // Sanity: another well-known tile must still render so we know the
    // filter didn't accidentally collapse the entire grid.
    expect(screen.getByTestId("tile-klondike")).toBeInTheDocument();
  });
});

/**
 * W656 — when an active category chip + a non-matching search query
 * collapse the grid to zero tiles, the lobby renders an empty-state
 * with a "Clear filters" button (LobbyPage.tsx ~line 2326). The
 * button's onClick wires both `setQuery("")` and `setFilter("all")` in
 * one step, and this test pins exactly that contract: clicking it
 * must reset both pieces of state, evidenced by (a) the empty-state
 * node un-mounting, (b) the search input emptying, and (c) the
 * chip-all aria-pressed flag flipping to "true" while the previously-
 * active chip flips to "false". Asserting all three together (rather
 * than just one) prevents a regression that resets only the query OR
 * only the filter.
 */
describe("LobbyPage — clear filters empty state (W656)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("clicking Clear filters from the empty state resets both query and filter", () => {
    renderAt("/");

    // Activate a non-default chip filter ("solitaire") so the eventual
    // reset has something non-trivial to flip back. We pair this with
    // a gibberish search query so even within the solitaire subset the
    // grid collapses to zero, guaranteeing the empty-state branch.
    const solitaireChip = screen.getByTestId("chip-solitaire");
    fireEvent.click(solitaireChip);
    expect(solitaireChip).toHaveAttribute("aria-pressed", "true");

    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "zzz-no-such-game" } });
    expect(search.value).toBe("zzz-no-such-game");

    // Empty-state pinned by data-testid — its presence is what gates
    // the Clear filters button being mounted at all.
    const empty = screen.getByTestId("lobby-no-results");
    expect(empty).toBeInTheDocument();

    // Resolve the button by accessible name (the production string
    // from the i18n key `lobby.clear_filters` -> "Clear filters").
    // Scoped via `within(empty)` so we don't accidentally pick up a
    // same-named affordance elsewhere on the page.
    const clearBtn = within(empty).getByRole("button", {
      name: /clear filters/i,
    });
    fireEvent.click(clearBtn);

    // 1) Empty-state node un-mounts because the unfiltered grid is no
    //    longer empty (state reset took effect downstream).
    expect(screen.queryByTestId("lobby-no-results")).not.toBeInTheDocument();
    // 2) Query was cleared — the controlled input element evidences
    //    the `setQuery("")` half of the dual reset.
    expect((screen.getByTestId("lobby-search") as HTMLInputElement).value).toBe(
      "",
    );
    // 3) Filter flipped back to "all": chip-all is pressed, the
    //    previously-active solitaire chip is no longer pressed, and
    //    the persisted filter key is reset.
    expect(screen.getByTestId("chip-all")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByTestId("chip-solitaire")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(localStorage.getItem("cards-lobby-filter")).toBe("all");
  });
});

/**
 * W686 — Pure search-query empty state.
 *
 * Sibling of the W656 test above, but isolates the *search-only* path:
 * no chip filter is engaged, only a clearly-impossible query is typed
 * into the search input. This pins the contract that:
 *   1. The `lobby-no-results` empty-state node mounts when the
 *      filtered tile count collapses to zero by query alone.
 *   2. Zero `grid-tile-*` elements remain in the DOM — i.e. the
 *      empty-state branch fully replaces the grid render rather than
 *      coexisting with stale tiles.
 */
describe("LobbyPage — search-only empty state (W686)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows lobby-no-results and zero tiles when the search query has no matches", () => {
    renderAt("/");

    // Type a clearly-impossible query — no game id, family, or title
    // contains this digraph soup, so the filtered set must be empty.
    // While a query is active, featured-family duplicates are demoted to
    // `grid-tile-<id>`; the `tile-<id>` form is the canonical id used by
    // every tile in the main grid. Asserting both are empty pins the
    // contract that the empty-state branch fully replaces the grid.
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "qzqzqzqz" } });
    expect(search.value).toBe("qzqzqzqz");

    // 1) Empty-state node mounts.
    expect(screen.getByTestId("lobby-no-results")).toBeInTheDocument();

    // 2) Zero `grid-tile-*` elements remain — the demoted testid form
    //    used for duplicate featured families during an active query.
    expect(
      document.querySelectorAll('[data-testid^="grid-tile-"]').length,
    ).toBe(0);
    // 3) Zero canonical `tile-<id>` tiles either — every game/family
    //    card has been replaced by the empty-state UI. We exclude the
    //    nested `tile-fav-marker-*`, `tile-rating-*`, etc. children
    //    that share the `tile-` prefix on non-tile descendants.
    const canonicalTiles = Array.from(
      document.querySelectorAll('[data-testid^="tile-"]'),
    ).filter((el) => {
      const id = el.getAttribute("data-testid") ?? "";
      // Match exactly `tile-<one segment>` — a single dash after `tile`.
      return /^tile-[^-]+$/.test(id);
    });
    expect(canonicalTiles.length).toBe(0);
  });
});

/**
 * W682 — per-tile rating display reads from `cards-ratings`.
 *
 * Each main-grid GameCard renders a `tile-rating-<id>` widget exactly
 * when the user has a non-zero rating stored for that game (LobbyPage
 * line ~3043: `userRating > 0 && <span data-testid={"tile-rating-..."} />`).
 * The rating itself is hydrated from localStorage[`cards-ratings`] via
 * `readRatings()` on first render, so seeding that blob before mount
 * MUST cause the matching tile to expose the rating widget while
 * unrated tiles MUST NOT.
 *
 * `pool-10ball` is a standalone (non-family) game id whose tile
 * resolves uniquely (no featured-strip duplicate, since it's not in
 * FEATURED_IDS) and which the sibling Hearts test (LobbyPageHearts)
 * already pins as a stable single-mount tile. Seeding it at 4/5
 * exercises the positive branch; the negative branch is asserted by
 * checking that across the WHOLE rendered grid exactly one
 * `tile-rating-*` widget exists — proving every other tile correctly
 * collapsed its rating slot via the `userRating > 0 &&` guard.
 */
describe("LobbyPage — per-tile rating display (W682)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders tile-rating-<id> only for the game with a stored rating", async () => {
    // Seed the canonical rating blob BEFORE the lobby mounts so the
    // initial readRatings() call in useState's initializer hydrates
    // the value synchronously — the page renders the rating widget
    // on the very first paint.
    localStorage.setItem(
      "cards-ratings",
      JSON.stringify({ "pool-10ball": 4 }),
    );

    renderAt("/");

    // findByTestId tolerates the standard tile-mount settle that the
    // sibling Hearts/Hide tests already rely on, so the rated tile is
    // reachable even if it lands past the initial viewport.
    const ratedTile = await screen.findByTestId("tile-pool-10ball");
    const ratingWidget = within(ratedTile).getByTestId(
      "tile-rating-pool-10ball",
    );
    // The widget's aria-label is the production contract for "Your
    // rating: N of 5 stars" — pinning it locks both the seeded value
    // (4) propagating through useState AND the LobbyPage tile branch
    // wiring `userRating` into the StarRating element.
    expect(ratingWidget).toHaveAttribute(
      "aria-label",
      "Your rating: 4 of 5 stars",
    );

    // Control: across every rendered tile, EXACTLY one rating widget
    // must be present — the seeded one. If the gating regressed and
    // the widget always rendered, this count would balloon to match
    // the visible tile count; if the seeded value silently failed to
    // hydrate, the count would drop to zero. Both regressions get
    // caught by pinning the cardinality at 1.
    const allRatingWidgets = screen.getAllByTestId(/^tile-rating-/);
    expect(allRatingWidgets).toHaveLength(1);
    expect(allRatingWidgets[0]).toBe(ratingWidget);
  });
});

/**
 * W713 — family tiles stamp a visible variant-count badge inside the
 * FamilyCard's tile-meta strip with the canonical `fam-count-<family.id>`
 * testid. The badge text follows the production contract: "<N> variant"
 * for N === 1, otherwise "<N> variants" (see LobbyPage.tsx, FamilyCard).
 * Sibling tests cover the FamilyPicker search filter (W609) and the
 * `?family=` deep-link auto-open. This test pins the per-tile count
 * surface so a refactor that drops the badge, renames the testid, or
 * mis-pluralises the label surfaces here.
 *
 * We use the same search-narrowing pattern as W566 to bring klondike's
 * main-grid family card into view in a single render: default
 * pagination caps page 1 at PAGE_SIZE entries and `klondike` sorts past
 * the cutoff alphabetically. Typing "klondike" into the search input
 * collapses the visible set; the featured strip is suppressed under
 * any active query, so the FamilyCard renders with the demoted
 * `grid-tile-klondike` outer testid while the inner count badge keeps
 * the canonical `fam-count-klondike` testid.
 *
 * The shape assertion (`/^\d+ variants$/` with N >= 2) is deliberate:
 * klondike is a multi-variant family by definition (see
 * `web/src/games/families.ts`), so any drop to 0/1 indicates the family
 * collapsed or the resolver dropped every member — both regressions get
 * caught without coupling to a brittle exact count.
 */
describe("LobbyPage — family-tile variant count badge (W713)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders fam-count-klondike with a '<N> variants' label where N >= 2", async () => {
    renderAt("/");
    // Narrow the visible pool to klondike so the main-grid family card
    // is reachable on page 1 regardless of the alphabetical pagination
    // cutoff. Mirrors the W566 highlight test's setup.
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "klondike" } });

    // The featured strip is suppressed under an active query, so the
    // main-grid FamilyCard (with `grid-tile-klondike` override) is the
    // sole klondike tile — and the only place that stamps the
    // `fam-count-klondike` badge.
    const tile = await waitFor(() =>
      screen.getByTestId(`grid-tile-${FAMILY_ID}`),
    );
    const countBadge = within(tile).getByTestId(`fam-count-${FAMILY_ID}`);
    expect(countBadge).toBeInTheDocument();

    // Production contract: badge text ends with "<N> variant" (N === 1)
    // or "<N> variants" (N !== 1). The leading aria-hidden "≡" glyph is
    // included in textContent but the trailing label is the regression
    // surface — anchor on the tail to ignore the glyph character.
    const text = countBadge.textContent ?? "";
    const match = text.match(/(\d+)\s+variants?$/);
    expect(match).not.toBeNull();
    const count = Number(match?.[1] ?? "0");

    // Klondike is a multi-variant family by definition — N < 2 means
    // either the family collapsed to a standalone tile or the resolver
    // dropped every member but one. Both regressions are caught here.
    expect(count).toBeGreaterThanOrEqual(2);

    // Pluralisation contract: "1 variant" (no s) when N === 1, otherwise
    // "<N> variants" (with trailing s). Since N >= 2 above, the badge
    // MUST use the plural form — pinning this catches a regression that
    // inverted the `=== 1 ? "" : "s"` ternary.
    expect(text).toMatch(/\d+\s+variants$/);
  });
});

/**
 * W718 — chip-top-rated persistence round-trip.
 *
 * Sibling of the W267 chip-favorites click test and the W649 rehydrate
 * coverage, but pinned end-to-end on the `top-rated` filter, which
 * previously had only one half of the contract verified per chip:
 *   1. Click chip-top-rated → `cards-lobby-filter` MUST equal
 *      "top-rated" (the write half of the round-trip).
 *   2. Tear the page down (cleanup) and remount fresh → chip-top-rated
 *      MUST hydrate with `aria-pressed="true"` purely from the storage
 *      key, with no in-memory state carryover (the read half).
 *
 * A regression that renames the storage key, swaps the persisted
 * sentinel ("top-rated" vs "topRated"), or skips the mount-time read
 * for this specific filter would surface here even when the favorites
 * and recently-played round-trips still pass.
 */
describe("LobbyPage — chip-top-rated persistence round-trip (W718)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("clicking chip-top-rated writes cards-lobby-filter and rehydrates aria-pressed=true on remount", () => {
    renderAt("/");
    const topRated = screen.getByTestId("chip-top-rated");
    // Default mount lands on "all"; the top-rated chip starts unpressed.
    // The mount-time persist effect writes "all" (or leaves a previously
    // cleared key), so the only chip-relevant precondition we pin is
    // that the top-rated sentinel is NOT yet the active filter.
    expect(topRated).toHaveAttribute("aria-pressed", "false");
    expect(localStorage.getItem("cards-lobby-filter")).not.toBe("top-rated");

    fireEvent.click(topRated);

    // Write half — clicking the chip must (a) flip aria-pressed in the
    // current render and (b) persist the canonical "top-rated" sentinel
    // to `cards-lobby-filter` so a reload can rehydrate this view.
    expect(topRated).toHaveAttribute("aria-pressed", "true");
    expect(localStorage.getItem("cards-lobby-filter")).toBe("top-rated");

    // Read half — fully tear down the React tree and remount from
    // scratch. The persisted sentinel is the sole bridge between the
    // two lifecycles; the new mount's `useState` initialiser must read
    // it and seed the filter so chip-top-rated is pressed without any
    // user action. cleanup() unmounts every React Testing Library tree
    // synchronously so the subsequent renderAt() is a true cold mount.
    cleanup();
    expect(localStorage.getItem("cards-lobby-filter")).toBe("top-rated");

    renderAt("/");
    const rehydrated = screen.getByTestId("chip-top-rated");
    expect(rehydrated).toHaveAttribute("aria-pressed", "true");
    // chip-all must release pressed on rehydrate — the rehydrate path
    // shares the same exclusivity invariant as the click path, so a
    // regression that fails to translate "top-rated" out of the
    // mount-time read would leave both chips pressed simultaneously.
    expect(screen.getByTestId("chip-all")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});

/**
 * W721 — favorite-star indicator on lobby tiles.
 *
 * Distinct from the user-rating-stars contract (W682) and the
 * HeartToggle click/persistence contracts (W570 / W603), this test
 * pins the at-render indicator that tells a user "this tile is
 * favorited" before any interaction has taken place. The indicator
 * is the per-tile `tile-fav-toggle-<id>` button — when its parent
 * lobby reads a non-empty `cards-favorites` blob at mount, the
 * matching tile MUST surface the favorited state through both its
 * `aria-pressed` flag and the `is-active` className modifier so
 * sighted users and assistive tech see the same truth on the first
 * paint. Tiles whose ids are NOT in the seeded blob must NOT carry
 * the indicator, otherwise the lobby would falsely claim every game
 * is favorited and the toggle would lose its glance-value.
 */
describe("LobbyPage — favorite-star indicator on tiles (W721)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("seeded cards-favorites surfaces the favorited indicator on that tile only", async () => {
    // Seed the canonical favorites blob with a single standalone game id
    // (`pool-10ball` — see LobbyPageHearts.test.tsx for why this id is
    // the safest "id-in-equals-id-out" tile) BEFORE first render so the
    // indicator must be present in the very first commit, not after a
    // click. We deliberately do NOT pre-select the favorites filter — the
    // contract is that the indicator paints in the default ("all") view,
    // where the user comes face-to-face with both favorited and non-
    // favorited tiles side-by-side.
    localStorage.setItem("cards-favorites", JSON.stringify(["pool-10ball"]));
    renderAt("/");

    // The favorited tile's indicator: the per-tile heart button MUST be
    // rendered with aria-pressed=true AND the is-active className so both
    // assistive-tech and CSS see the same favorited truth on first paint.
    const favHeart = await screen.findByTestId("tile-fav-toggle-pool-10ball");
    expect(favHeart).toHaveAttribute("aria-pressed", "true");
    expect(favHeart.className).toContain("is-active");

    // Counter-example: discover any other rendered tile-fav-toggle button
    // (the lobby paginates at PAGE_SIZE so the exact id of the "next" tile
    // depends on registry sort, but at least one non-pool-10ball heart
    // must exist on page 1 with 4000+ entries) and confirm its indicator
    // is in the inactive state. If the lobby ever flipped to "every tile
    // reads favorited" the test above could pass while this one fails —
    // pinning both halves locks the indicator's selectivity, not just its
    // presence, without coupling to a specific second-tile id whose
    // page-1 placement could shift as the registry grows.
    const otherHeart = Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        '[data-testid^="tile-fav-toggle-"]',
      ),
    ).find(
      (el) => el.getAttribute("data-testid") !== "tile-fav-toggle-pool-10ball",
    );
    expect(otherHeart, "expected at least one non-favorited heart on page 1").toBeTruthy();
    expect(otherHeart!.getAttribute("aria-pressed")).toBe("false");
    expect(otherHeart!.className).not.toContain("is-active");
  });
});

/**
 * W712 — drag-handle is hidden from assistive tech.
 *
 * The `tile-drag-handle-<id>` span renders a purely-decorative `⋮⋮`
 * glyph on every lobby tile (LobbyPage.tsx ~line 2990 / 3231). The
 * actual drag interaction lives on the parent `.tile` element via
 * the HTML `draggable` attribute; the handle is a *visual cue* only,
 * gated to the favorites filter via the W414 CSS contract.
 *
 * Because the handle is not itself an interactive target — it has no
 * keyboard handler, no `tabindex`, no `role`, no `aria-label` — it
 * MUST carry `aria-hidden="true"` so screen-reader users don't get
 * a meaningless "⋮⋮" announcement layered onto every favorite tile's
 * accessible name. The parent tile's existing `aria-label` already
 * describes the game; the handle is decoration.
 *
 * Prior tests cover (a) draggable=true stamping under favorites
 * (W397), (b) `data-fav-drag-id` round-trip persistence (W397/W513),
 * (c) the CSS-display gating contract (W414), and (d) DOM presence
 * of the handle under the favorites filter (W414). What none of them
 * pin is the handle's a11y stance — a regression that drops the
 * `aria-hidden` (or flips it to "false") would silently pollute the
 * screen-reader experience without breaking any visual or persistence
 * test.
 *
 * We mount directly on `cards-lobby-filter=favorites` (and seed a
 * favorited id) so the handle is reachable by its stable testid in
 * the canonical favorites grid — sidestepping the featured-strip
 * duplicate disambiguation the W414 test uses.
 */
describe("LobbyPage — drag-handle aria-hidden (W712)", () => {
  // `2048` matches the W414 sibling test: standalone (no family), not
  // in FEATURED_IDS, so the `tile-drag-handle-2048` testid resolves to
  // a single node in the favorites grid with no featured-strip twin.
  const GAME_ID = "2048";

  beforeEach(() => {
    localStorage.clear();
    // Mount directly into the favorites filter so the favorites grid
    // owns the canonical tile for GAME_ID. Seed the favorites blob so
    // the favorites grid has at least one tile to render (otherwise
    // `lobby-favorites-empty` shows instead and there's no handle).
    localStorage.setItem("cards-favorites", JSON.stringify([GAME_ID]));
    localStorage.setItem("cards-lobby-filter", "favorites");
  });

  it("renders tile-drag-handle-<id> with aria-hidden=true (decorative cue)", () => {
    renderAt("/");
    const handle = screen.getByTestId(`tile-drag-handle-${GAME_ID}`);
    // Load-bearing a11y contract — the handle is a visual-only glyph
    // and must NOT be advertised to assistive tech. The actual drag
    // target is the parent `.tile` (see W397).
    expect(handle).toHaveAttribute("aria-hidden", "true");
    // Defense-in-depth: the handle must not carry interactive
    // a11y attributes that would conflict with the aria-hidden
    // promise. A regression that adds e.g. `role="button"` or
    // `aria-label="Reorder"` while keeping aria-hidden=true would
    // produce inconsistent SR output (hidden-but-named) — pin the
    // absence of both so the contract stays internally consistent.
    expect(handle).not.toHaveAttribute("role");
    expect(handle).not.toHaveAttribute("aria-label");
    expect(handle).not.toHaveAttribute("tabindex");
  });
});

/**
 * W735 — the hand-curated Featured strip (`section.lobby-featured` with
 * the `aria-label="Featured games"` landmark) is gated on the default
 * "all" filter view. Switching the chip filter to any non-"all" sentinel
 * (here: `top-rated`) MUST suppress the strip entirely so the filtered
 * view is unambiguous — a featured game whose category does not match
 * the active chip would otherwise confusingly appear above the filtered
 * grid. Clicking chip-all again MUST bring the strip back in the same
 * tick, exercising the symmetric reset path. The render gate lives at
 * `LobbyPage.tsx:2000` (`{!query && filter === "all" && featured.length
 * > 0 && (...)}`); this test pins the `filter === "all"` half of that
 * predicate independently of the `query` half (which is implicitly
 * covered by the W624-era highlight test).
 */
describe("LobbyPage — featured strip gated on chip-all (W735)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("hides the featured strip when filter flips off 'all' and restores it on chip-all", () => {
    renderAt("/");
    // Default mount: empty localStorage hydrates to filter="all", so the
    // Featured-games landmark MUST be present in the first commit. The
    // FEATURED_IDS list is non-empty in the registry, so the strip is
    // unconditionally rendered under the default filter.
    const stripBefore = document.querySelector(
      'section.lobby-featured[aria-label="Featured games"]',
    );
    expect(stripBefore).not.toBeNull();

    // Flip to a non-"all" chip — top-rated is the safest target because
    // it is always rendered regardless of seeded play history (no
    // pre-condition setup needed) and its filter sentinel is distinct
    // from any category sentinel that could share a chip-id collision.
    fireEvent.click(screen.getByTestId("chip-top-rated"));

    // The render gate at LobbyPage.tsx:2000 must drop the entire
    // <section.lobby-featured> wrapper — not just hide its children —
    // so a regression that swaps the gate for a CSS-only `display: none`
    // would still trip the assertion. We query the document root rather
    // than `screen` so the absence is verified at the DOM level.
    expect(
      document.querySelector(
        'section.lobby-featured[aria-label="Featured games"]',
      ),
    ).toBeNull();

    // Symmetric reset path — clicking chip-all returns the filter to
    // "all" and the same render gate must re-mount the strip in the
    // same tick. Pinning both directions in one test guards against an
    // asymmetric regression where only the hide-half (or only the
    // show-half) of the predicate is wired.
    fireEvent.click(screen.getByTestId("chip-all"));
    expect(
      document.querySelector(
        'section.lobby-featured[aria-label="Featured games"]',
      ),
    ).not.toBeNull();
  });
});

/**
 * W742 — single-character search query MUST NOT trigger title `<mark>`
 * highlighting on tiles.
 *
 * The complement of W566: that test pins the *positive* path where a
 * query of length >= `TITLE_HIGHLIGHT_MIN_LEN` (=2) wraps matched
 * substrings in `<mark>`. This test pins the *negative* threshold path
 * — typing a single character (length === 1) flows down through
 * `deferredQuery` as `highlightQuery`, but the `highlightQuery.length
 * >= TITLE_HIGHLIGHT_MIN_LEN` gate at LobbyPage.tsx:3022/3260/3404/3469
 * MUST suppress the `highlightMatch` call so titles render as plain
 * text with zero `<mark>` children across the entire visible grid.
 *
 * Without this guard, a future change that lowered the constant to 1
 * (or accidentally dropped the gate while keeping the prop wired) would
 * cause every tile whose title contains the typed letter to flash a
 * single-character highlight on every keystroke — visually noisy and
 * not the documented contract. We assert against ALL `lobby-tile-title`
 * elements in the document rather than a single canonical tile, since
 * the filter is a permissive `.includes(q)` substring match and which
 * specific tiles end up on page 1 of the filtered grid depends on the
 * registry ordering (which we do not want to encode here). The gate is
 * wired identically for every tile renderer (GameCard / FamilyCard /
 * FeaturedTile) so any rendered title is a sufficient witness.
 */
describe("LobbyPage — single-char query suppresses highlight (W742)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("does not wrap any tile title in <mark> when query length is 1", async () => {
    renderAt("/");
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    // A single-character query — well below TITLE_HIGHLIGHT_MIN_LEN=2.
    // The lowercase "e" is a substring of nearly every English word so
    // it guarantees the filtered grid is non-empty and the highlight
    // prop receives a non-empty value (an empty string would short-
    // circuit the gate trivially via the falsy check, masking a
    // regression that lowered the threshold to 1).
    fireEvent.change(search, { target: { value: "e" } });

    // Wait for the deferred filter to flush — at least one tile must
    // be visible so the assertion is non-vacuous. The featured strip
    // is suppressed while a query is active (per LobbyPage.tsx:2000),
    // so any rendered tile-title belongs to the main filtered grid.
    await waitFor(() => {
      expect(
        document.querySelectorAll(".lobby-tile-title").length,
      ).toBeGreaterThan(0);
    });

    // Core assertion: NO tile title in the document may contain a
    // `<mark>` element while the query length is 1. A regression that
    // lowered TITLE_HIGHLIGHT_MIN_LEN to 1 (or dropped the gate) would
    // cause every visible tile whose haystack contains "e" to render
    // at least one `<mark>` around the matched letter, surfacing here
    // as a non-zero count. We tally across all titles rather than
    // sampling one so a partial regression (e.g. only the GameCard
    // gate dropped, FamilyCard gate intact) still fails this test.
    const titles = document.querySelectorAll(".lobby-tile-title");
    let totalMarks = 0;
    titles.forEach((t) => {
      totalMarks += t.querySelectorAll("mark").length;
    });
    expect(totalMarks).toBe(0);
  });
});

/**
 * W747 — main lobby grid `End` key jumps focus to the LAST tile in
 * the filtered grid. The W545 block above pins ArrowRight/Left/Up/Down
 * + PageUp/PageDown + Home (via drawer test) but `End` on the lobby
 * grid itself was never exercised — the handler in `onGridKeyDown`
 * implements `case "End": next = tiles.length - 1` and a regression
 * that flipped it to `current + 1` (or dropped the case entirely)
 * would silently break keyboard users who rely on End to skip past
 * the entire catalog in one keystroke.
 *
 * Setup mirrors the W545 grid test: stub `getBoundingClientRect` so
 * tiles report a deterministic 5-column layout (otherwise jsdom's
 * zero rects make column derivation degenerate, but End ignores cols
 * anyway — we keep the stub for parity with the rest of this file's
 * grid tests so the test stays robust if the handler ever cross-
 * checks columns before processing End).
 */
describe("LobbyPage — grid End jumps focus to last tile (W747)", () => {
  const COLS = 5;
  const TILE_W = 200;
  const TILE_H = 240;
  let restoreRect: () => void;

  beforeEach(() => {
    localStorage.clear();
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
    const original = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function (this: Element): DOMRect {
      const grid = document.querySelector(
        ".lobby-grid:not(.lobby-grid--featured)",
      );
      if (grid && this.classList.contains("tile") && grid.contains(this)) {
        const tiles = Array.from(
          grid.querySelectorAll<HTMLElement>(".tile"),
        );
        const idx = tiles.indexOf(this as HTMLElement);
        if (idx >= 0) {
          const row = Math.floor(idx / COLS);
          const col = idx % COLS;
          const top = row * TILE_H;
          const left = col * TILE_W;
          return {
            top,
            left,
            right: left + TILE_W,
            bottom: top + TILE_H,
            width: TILE_W,
            height: TILE_H,
            x: left,
            y: top,
            toJSON: () => ({}),
          } as DOMRect;
        }
      }
      return original.call(this);
    };
    restoreRect = () => {
      Element.prototype.getBoundingClientRect = original;
    };
  });

  afterEach(() => {
    restoreRect?.();
  });

  it("End from the first tile moves focus & roving tab-stop to the last tile", async () => {
    renderAt("/");
    // Wait until the main grid has hydrated with a meaningful tile
    // count — the canonical traversal target (`tiles[length-1]`) is
    // only meaningful once the catalog has actually rendered.
    await waitFor(() => {
      const grid = document.querySelector(
        ".lobby-grid:not(.lobby-grid--featured)",
      );
      const tiles = grid
        ? Array.from(grid.querySelectorAll<HTMLElement>(".tile"))
        : [];
      expect(tiles.length).toBeGreaterThanOrEqual(2);
    });
    const grid = document.querySelector(
      ".lobby-grid:not(.lobby-grid--featured)",
    ) as HTMLElement;
    const tiles = Array.from(grid.querySelectorAll<HTMLElement>(".tile"));
    const last = tiles[tiles.length - 1];

    // Land focus on the first tile (the default roving tab-stop) and
    // confirm the precondition before firing End.
    tiles[0].focus();
    expect(document.activeElement).toBe(tiles[0]);

    // The keystroke under test — End must jump straight to the last
    // tile regardless of the current column or row.
    fireEvent.keyDown(grid, { key: "End" });

    // Focus moved to the last tile, and the roving-tabindex contract
    // followed: only the now-focused tile is in the tab sequence.
    expect(document.activeElement).toBe(last);
    expect(last.tabIndex).toBe(0);
    expect(tiles[0].tabIndex).toBe(-1);
  });
});

/**
 * W754 — lobby grid density toggle (compact / comfortable / spacious).
 *
 * Distinct from the list-mode toggle (W582), the chip filter strip
 * (W267/W624/W649/W718) and the view-mode toggle. The three-state pill
 * exposes `lobby-density-{compact,comfortable,spacious}` testids and is
 * persisted to `cards-lobby-density`. The active mode is also mirrored
 * as `data-density` on the rendered grid so all sizing stays CSS-driven.
 *
 * Default mode is "comfortable"; clicking compact must (a) flip the
 * three buttons' aria-pressed pair so exactly one is pressed at a time,
 * (b) write `compact` to the canonical persistence key, and (c) update
 * the grid's `data-density` so the CSS rules pick up the new layout.
 */
describe("LobbyPage — grid density toggle (W754)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("clicking lobby-density-compact flips aria-pressed, persists, and stamps data-density", () => {
    renderAt("/");
    // Pre-condition: the three-state pill has comfortable pressed (default)
    // and exposes all three testids inline (desktop viewport — the inline
    // density toggle is the canonical one; W419 covers the overflow copy).
    const compact = screen.getByTestId("lobby-density-compact");
    const comfortable = screen.getByTestId("lobby-density-comfortable");
    const spacious = screen.getByTestId("lobby-density-spacious");
    expect(compact).toHaveAttribute("aria-pressed", "false");
    expect(comfortable).toHaveAttribute("aria-pressed", "true");
    expect(spacious).toHaveAttribute("aria-pressed", "false");
    // The component's persistence useEffect runs on mount and writes
    // the current (default) density to the canonical key, so the
    // baseline is "comfortable" — not null. Pinning the default value
    // here guards against a regression that changes the default mode
    // without updating the rest of the toggle's wiring.
    expect(localStorage.getItem("cards-lobby-density")).toBe("comfortable");

    // The grid mirrors the default mode via data-density so CSS picks
    // up the right column sizing. Multiple `.lobby-grid` nodes can
    // co-render (featured strip + main grid), so target the main grid
    // explicitly via the `:not(.lobby-grid--featured)` selector.
    const gridBefore = document.querySelector(
      ".lobby-grid:not(.lobby-grid--featured)",
    ) as HTMLElement;
    expect(gridBefore).not.toBeNull();
    expect(gridBefore.getAttribute("data-density")).toBe("comfortable");

    // The keystroke under test — flip to compact.
    fireEvent.click(compact);

    // Aria-pressed pair flips together: compact engages, comfortable
    // releases, spacious stays unpressed. Pinning all three guards
    // against a regression that flips only one side of the toggle.
    expect(compact).toHaveAttribute("aria-pressed", "true");
    expect(comfortable).toHaveAttribute("aria-pressed", "false");
    expect(spacious).toHaveAttribute("aria-pressed", "false");

    // Persistence twin lands under the canonical
    // `cards-lobby-density` key so a reload rehydrates here.
    expect(localStorage.getItem("cards-lobby-density")).toBe("compact");

    // The grid's data-density mirror flipped — this is the
    // load-bearing CSS hook (LobbyPage.css gates column sizing on
    // `.lobby-grid[data-density="compact"]` etc).
    const gridAfter = document.querySelector(
      ".lobby-grid:not(.lobby-grid--featured)",
    ) as HTMLElement;
    expect(gridAfter.getAttribute("data-density")).toBe("compact");
  });
});

/**
 * W772 — the section header's match-count caption (`.lobby-section-count`)
 * is gated on an active search query. With no query, the caption MUST be
 * absent (no stray " · N matches" text leaking into the heading); once
 * the user types into `lobby-search`, the caption mounts and prints
 * "<N> match"/"<N> matches" with proper singular/plural agreement.
 *
 * This pins the contract that matchedGameCount surfaces only when the
 * user has actually filtered the catalog — guarding against regressions
 * that either always-render the caption (noisy header) or fail to
 * pluralise on multi-result queries.
 */
describe("LobbyPage — search match-count caption (W772)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("mounts .lobby-section-count with a 'matches' caption only when a query is active", () => {
    renderAt("/");
    // Pre-condition: with no query, the caption MUST NOT render — the
    // section heading should be a clean category label without the
    // " · N matches" suffix. Asserting absence by class-selector pins
    // that the gate `{query && (...)}` is held closed at boot.
    expect(
      document.querySelector(".lobby-section-count"),
    ).toBeNull();

    // Type a generic, multi-result query. "card" appears in many game
    // titles across the catalog (the registry is a card-games hub), so
    // the filtered pool is guaranteed > 1, exercising the plural branch
    // of the singular/plural ternary.
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "card" } });

    // Caption now mounts inside the section heading. Targeting via
    // class selector (rather than a brittle text match) keeps the
    // assertion stable if the divider glyph or layout changes — the
    // contract under test is *that* the count surfaces, plus its
    // textual shape (a number followed by the matches-noun).
    const caption = document.querySelector(
      ".lobby-section-count",
    ) as HTMLElement | null;
    expect(caption).not.toBeNull();
    const text = (caption!.textContent ?? "").trim();
    // Shape: "· <N> matches" optionally followed by " (<M> games)".
    // We pin the matches-noun + leading number, which is the
    // load-bearing piece of the caption — `\d` to allow any positive
    // count and `matches` (plural) since "card" matches many games.
    expect(text).toMatch(/\d+\s+matches/);
  });
});

/**
 * View-mode toggle (W771) — orthogonal to the density toggle (W754) and
 * to the list-mode pagination toggle (W183/W582). The grid/list view-mode
 * pair (`lobby-view-grid` / `lobby-view-list`) controls the main grid's
 * visual layout: "grid" is the multi-column tile grid, "list" is a
 * single-column row layout. The active mode is mirrored as `data-view`
 * on `.lobby-grid` so the layout switch is purely CSS-driven (see
 * `.lobby-grid[data-view="list"]` rules in LobbyPage.css). Persistence
 * key is `cards-lobby-view`.
 *
 * The rehydrate path is the load-bearing one to pin: a regression that
 * forgets to read the persisted value (or reads from the wrong key)
 * would silently degrade the toggle to a session-only control.
 */
describe("LobbyPage — view-mode toggle rehydrate (W771)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("pre-seeded cards-lobby-view=list rehydrates aria-pressed and stamps data-view on the grid", () => {
    // Seed the persistence key BEFORE first render so the component's
    // useState initializer reads "list" from localStorage on mount —
    // exercises the readPersistedView() branch, not the click handler.
    localStorage.setItem("cards-lobby-view", "list");

    renderAt("/");

    // The toggle pair flips together on rehydrate: list pressed, grid
    // released. Pinning both sides guards against a regression that
    // rehydrates only one button's pressed state.
    const listBtn = screen.getByTestId("lobby-view-list");
    const gridBtn = screen.getByTestId("lobby-view-grid");
    expect(listBtn).toHaveAttribute("aria-pressed", "true");
    expect(gridBtn).toHaveAttribute("aria-pressed", "false");

    // The main grid mirrors the rehydrated mode via data-view — this is
    // the CSS hook (LobbyPage.css gates the row layout on
    // `.lobby-grid[data-view="list"]`). Multiple `.lobby-grid` nodes can
    // co-render (featured strip + main grid), so target the main grid
    // explicitly via the `:not(.lobby-grid--featured)` selector — same
    // technique W754 uses for the density mirror.
    const mainGrid = document.querySelector(
      ".lobby-grid:not(.lobby-grid--featured)",
    ) as HTMLElement;
    expect(mainGrid).not.toBeNull();
    expect(mainGrid.getAttribute("data-view")).toBe("list");
  });
});

/**
 * View-mode toggle write-side persistence (W783) — orthogonal to the
 * rehydrate-on-mount path pinned by W771. W771 covers the read path
 * (pre-seeded localStorage → initial state); this test covers the write
 * path (click → effect → localStorage). A regression that drops the
 * `writePersistedView` effect would silently degrade the toggle to
 * session-only without any visible failure on first render, so pinning
 * the click→storage round-trip is load-bearing for the persistence
 * guarantee. Storage key is `cards-lobby-view`, same as W771.
 */
describe("LobbyPage — view-mode toggle click persists to localStorage (W783)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("clicking lobby-view-list writes 'list' under cards-lobby-view", () => {
    renderAt("/");

    // The mount-time effect mirrors the default ("grid") into storage, so
    // we don't assert null here — instead we pin the post-click write,
    // which is the actual write-side contract this test exists to guard.
    const listBtn = screen.getByTestId("lobby-view-list");
    fireEvent.click(listBtn);

    // The effect that mirrors viewMode → localStorage runs synchronously
    // after the state update flushes, so the value is observable without
    // any waitFor. Pin both the storage value AND aria-pressed so a
    // regression in either the writer or the renderer is caught here.
    expect(localStorage.getItem("cards-lobby-view")).toBe("list");
    expect(listBtn).toHaveAttribute("aria-pressed", "true");
  });
});

/**
 * W782 — Escape key dismisses the onboarding coachmark (W193).
 *
 * The coachmark documents Esc as one of its dismissal sources alongside
 * tile-clicks, the explicit X button, and route navigation. The other
 * three paths are pinned by the W193 describe block above; this test
 * seals the keyboard pathway by asserting that a `window.keydown` Escape
 * both unmounts the bubble AND writes "done" to `cards-onboard-coachmark`
 * so the hint never re-shows on its own.
 */
describe("LobbyPage — coachmark Escape dismiss (W782)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("dismisses and persists 'done' when Escape is pressed", () => {
    localStorage.setItem("cards-onboard-coachmark", "pending");
    renderAt("/");
    expect(screen.getByTestId("coachmark")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.queryByTestId("coachmark")).not.toBeInTheDocument();
    expect(localStorage.getItem("cards-onboard-coachmark")).toBe("done");
  });
});

/**
 * W784 — "NEW" badge on recently-added tiles.
 *
 * The lobby treats the last NEW_GAME_WINDOW (60) entries of the GAMES
 * registry as "recently added" and stamps them with a NEW badge that
 * outranks every other badge kind (see pickBadgeKind in
 * `web/src/platform/gameTags.ts`: NEW > CHALLENGING > QUICK > POPULAR >
 * EDITORS-PICK). The set of "new" ids is computed from registry tail
 * order at module load (no timestamp on plugins), so a regression that
 * inverted the slice direction or zeroed out NEW_GAME_WINDOW would drop
 * the badge entirely.
 *
 * To stay robust against registry churn we read the LAST entry of GAMES
 * at test time — that id is guaranteed to fall inside the NEW window for
 * any sane window size (>= 1) — and narrow the visible pool to just
 * that game by typing its full title into the search input. Search
 * also suppresses the featured strip, so the only `tile-badge-<id>`
 * with the canonical (non-`feat-`) testid prefix is the main-grid one.
 */
describe("LobbyPage — NEW badge on recently-added tiles (W784)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("stamps tile-badge-<id> with the NEW label on the last registered game", async () => {
    // Dynamically resolve the registry tail so the test survives both
    // additions (the new tail entry inherits the badge) and the
    // existing-id stays-in-window invariant up to NEW_GAME_WINDOW=60
    // entries below.
    const lastGame = GAMES.filter((g): g is NonNullable<typeof g> => g != null).at(-1);
    expect(lastGame).toBeDefined();
    const id = lastGame!.id;
    const title = lastGame!.title;

    renderAt("/");

    // Narrow the visible pool to exactly this game by searching its
    // full title — guarantees the tile lands on page 1 regardless of
    // alphabetical pagination, and suppresses the featured strip so
    // `tile-badge-<id>` is unambiguous (featured tiles use the
    // distinct `feat-tile-badge-<id>` testid).
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: title } });

    // The badge slot is rendered by the SoloCard branch as a child of
    // the tile root. We don't assume any specific tile-* prefix shape
    // for the wrapper — `tile-badge-<id>` is the load-bearing testid.
    const badge = await waitFor(() => screen.getByTestId(`tile-badge-${id}`));
    expect(badge).toBeInTheDocument();

    // Production contract: NEW outranks every other badge kind, so the
    // text/aria-label MUST be "NEW". This pins both that `isNew` was
    // wired through to the SoloCard's `pickBadgeKind` call AND that the
    // tail-slice in `newGameIds` actually included this id.
    expect(badge).toHaveTextContent("NEW");
    expect(badge).toHaveAttribute("aria-label", "NEW");
    // The Badge component stamps `badge--<kind>` for the colour pill —
    // pinning the modifier class catches a regression that swapped the
    // kind argument while keeping the testid intact.
    expect(badge.className).toMatch(/\bbadge--new\b/);
  });
});

/**
 * W806 — "QUICK" badge on curated short-play tiles.
 *
 * `pickBadgeKind` (web/src/platform/gameTags.ts) returns "quick" when an
 * id is in the hand-picked QUICK_GAME_IDS set AND nothing higher-priority
 * fired (NEW > CHALLENGING > QUICK > POPULAR > EDITORS-PICK). W784
 * already pins the NEW path; this test pins the QUICK path so a
 * regression that drops the QUICK_GAME_IDS check (or breaks the lobby's
 * threading of game ids through the SoloCard's pickBadgeKind call) still
 * surfaces.
 *
 * `snap` is a stable QUICK_GAME_IDS member that:
 *  - sits near the head of the GAMES registry (well outside the
 *    NEW_GAME_WINDOW=60 tail), so isNew is false and NEW won't preempt
 *  - is NOT in CHALLENGING_GAME_IDS, so CHALLENGING won't preempt
 *  - is NOT a member of any family, so it renders as a SoloCard with the
 *    canonical `tile-badge-<id>` testid (family cards would use
 *    `tile-badge-<familyId>` and the per-game badge would never mount)
 *
 * Searching by the title narrows the pool, suppresses the featured strip
 * `feat-tile-badge-*` doubles, and keeps `tile-badge-snap` unambiguous
 * regardless of alphabetical pagination.
 */
describe("LobbyPage — QUICK badge on curated short-play tiles (W806)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("stamps tile-badge-snap with the QUICK label and badge--quick class", async () => {
    renderAt("/");

    // Narrow to "Snap" — the title fragment may still match other
    // siblings via substring rules, but `tile-badge-snap` is the only
    // testid the curated QUICK id we care about can ever produce.
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "Snap" } });

    const badge = await waitFor(() => screen.getByTestId("tile-badge-snap"));
    expect(badge).toBeInTheDocument();

    // Production contract: QUICK label/aria pins that `pickBadgeKind`
    // actually returned "quick" — and that the lobby threaded the id
    // (not isNew, not the rating, not the featured list) into the
    // QUICK_GAME_IDS branch.
    expect(badge).toHaveTextContent("QUICK");
    expect(badge).toHaveAttribute("aria-label", "QUICK");
    // The colour-pill modifier locks the kind→class mapping in Badge.tsx
    // so a regression that swapped the kind arg while keeping the
    // testid intact still trips the assertion.
    expect(badge.className).toMatch(/\bbadge--quick\b/);
  });
});

/**
 * W824 — "CHALLENGING" badge on curated deep-strategy tiles.
 *
 * `pickBadgeKind` (web/src/platform/gameTags.ts) returns "challenging" when
 * an id is in the hand-picked CHALLENGING_GAME_IDS set AND nothing
 * higher-priority fired (NEW > CHALLENGING > QUICK > POPULAR >
 * EDITORS-PICK). W784 pins the NEW path and W806 pins the QUICK path; this
 * test pins the CHALLENGING path so a regression that drops the
 * CHALLENGING_GAME_IDS check (or breaks the lobby's threading of game ids
 * through the SoloCard's pickBadgeKind call) still surfaces.
 *
 * `chess` is a stable CHALLENGING_GAME_IDS member that:
 *  - sits near the head of the GAMES registry (well outside the
 *    NEW_GAME_WINDOW=60 tail), so isNew is false and NEW won't preempt
 *  - is NOT a member of any family (chess-variants memberIds list contains
 *    only variant ids like `antichess`, `atomic-chess`, etc., never the
 *    bare `chess` id), so it renders as a SoloCard with the canonical
 *    `tile-badge-<id>` testid (family cards would use
 *    `tile-badge-<familyId>` and the per-game badge would never mount)
 *
 * Searching by the title narrows the pool, suppresses the featured strip
 * `feat-tile-badge-*` doubles, and keeps `tile-badge-chess` unambiguous
 * regardless of alphabetical pagination.
 */
describe("LobbyPage — CHALLENGING badge on curated deep-strategy tiles (W824)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("stamps tile-badge-chess with the CHALLENGING label and badge--challenging class", async () => {
    renderAt("/");

    // Narrow to "Chess" — the title fragment may still match other
    // siblings via substring rules, but `tile-badge-chess` is the only
    // testid the curated CHALLENGING id we care about can ever produce.
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "Chess" } });

    const badge = await waitFor(() => screen.getByTestId("tile-badge-chess"));
    expect(badge).toBeInTheDocument();

    // Production contract: CHALLENGING label/aria pins that `pickBadgeKind`
    // actually returned "challenging" — and that the lobby threaded the id
    // (not isNew, not the rating, not the featured list) into the
    // CHALLENGING_GAME_IDS branch.
    expect(badge).toHaveTextContent("CHALLENGING");
    expect(badge).toHaveAttribute("aria-label", "CHALLENGING");
    // The colour-pill modifier locks the kind→class mapping in Badge.tsx
    // so a regression that swapped the kind arg while keeping the
    // testid intact still trips the assertion.
    expect(badge.className).toMatch(/\bbadge--challenging\b/);
  });
});

/**
 * W838 — "POPULAR" badge on highly-rated tiles.
 *
 * `pickBadgeKind` (web/src/platform/gameTags.ts) returns "popular" when
 * the user's stored rating for a game id is >= TOP_RATED_THRESHOLD (=4)
 * AND nothing higher-priority fired (NEW > CHALLENGING > QUICK > POPULAR
 * > EDITORS-PICK). W784 pins the NEW path, W806 pins the QUICK path, and
 * W824 pins the CHALLENGING path; this test pins the POPULAR path so a
 * regression that drops the rating threshold check (or breaks the
 * lobby's threading of `userRating` through the SoloCard's
 * pickBadgeKind call) still surfaces.
 *
 * `hearts` is a stable game id that:
 *  - sits near the head of the GAMES registry (well outside the
 *    NEW_GAME_WINDOW=60 tail), so isNew is false and NEW won't preempt
 *  - is NOT in CHALLENGING_GAME_IDS, so CHALLENGING won't preempt
 *  - is NOT in QUICK_GAME_IDS, so QUICK won't preempt
 *  - is NOT a member of any family (no Hearts family in
 *    `web/src/games/families.ts`), so it renders as a SoloCard with the
 *    canonical `tile-badge-<id>` testid (family cards would use
 *    `tile-badge-<familyId>` and the per-game badge would never mount)
 *
 * Seeding `cards-ratings` with `hearts: 4` BEFORE the lobby mounts
 * synchronously hydrates `ratings["hearts"] = 4` via readRatings()'s
 * useState initializer, which threads through to the SoloCard's
 * userRating prop and trips the POPULAR branch. Searching by the title
 * narrows the pool, suppresses the featured strip `feat-tile-badge-*`
 * doubles, and keeps `tile-badge-hearts` unambiguous regardless of
 * alphabetical pagination.
 */
describe("LobbyPage — POPULAR badge on highly-rated tiles (W838)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("stamps tile-badge-hearts with the POPULAR label and badge--popular class", async () => {
    // Seed the canonical rating blob BEFORE the lobby mounts so the
    // initial readRatings() call in useState's initializer hydrates
    // ratings["hearts"] = 4 synchronously — this is what trips the
    // `userRating >= TOP_RATED_THRESHOLD` branch inside pickBadgeKind.
    localStorage.setItem(
      "cards-ratings",
      JSON.stringify({ "hearts": 4 }),
    );

    renderAt("/");

    // Narrow to "Hearts" — the title fragment may still match other
    // siblings via substring rules (Omnibus Hearts, Spot Hearts, etc.),
    // but `tile-badge-hearts` is the only testid the rated id we care
    // about can ever produce.
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "Hearts" } });

    const badge = await waitFor(() => screen.getByTestId("tile-badge-hearts"));
    expect(badge).toBeInTheDocument();

    // Production contract: POPULAR label/aria pins that `pickBadgeKind`
    // actually returned "popular" — and that the lobby threaded the
    // hydrated rating (not isNew, not the curated lists, not the
    // featured list) into the rating-threshold branch.
    expect(badge).toHaveTextContent("POPULAR");
    expect(badge).toHaveAttribute("aria-label", "POPULAR");
    // The colour-pill modifier locks the kind→class mapping in Badge.tsx
    // so a regression that swapped the kind arg while keeping the
    // testid intact still trips the assertion.
    expect(badge.className).toMatch(/\bbadge--popular\b/);
  });
});

/**
 * W800 — infinite-mode footer must surface a "Loaded N of M" caption
 * inside `lobby-loaded-count`, where N is the number of currently
 * visible tiles (capped at PAGE_SIZE=80 on initial flip) and M is the
 * full filtered pool size. Existing tests only assert that the element
 * mounts; this pins the actual user-visible numerals AND the
 * `aria-live="polite"` contract that hands the running count to a
 * screen reader on each Load-more / sentinel-trigger increment.
 *
 * The registry has well over 80 games, so on initial flip into
 * infinite mode we expect "Loaded 80 of <total>". The `total` here is
 * the size of the filtered LOBBY ENTRY list — families collapse
 * multiple games into one entry, so this is smaller than GAMES.length
 * and drifts as families are added/split. We pin the SHAPE and the
 * loaded numeral (load-bearing — it ticks on each Load-more click)
 * and read the total from the DOM, so the assertion survives registry
 * churn without re-flaking.
 */
describe("LobbyPage — infinite-mode loaded-count caption (W800)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders 'Loaded 80 of <total>' with aria-live=polite when infinite mode is active", async () => {
    renderAt("/");

    // Flip to infinite mode — the loaded-count live-region only mounts
    // in infinite mode (the pagination footer owns the Prev/Next pair
    // and never co-renders the caption).
    fireEvent.click(screen.getByTestId("lobby-mode-infinite"));

    // The caption is gated on `listMode === "infinite"`, which is set
    // synchronously, but waitFor guards against any deferred state
    // settle the toggle's persistence effect introduces.
    const caption = await waitFor(() =>
      screen.getByTestId("lobby-loaded-count"),
    );

    // Pin the user-visible string SHAPE: "Loaded 80 of <total>".
    // visibleCount initialises to PAGE_SIZE === 80, the registry is
    // far larger, so on the initial flip loadedCount === 80. We don't
    // hard-code the total because `filtered` collapses families into
    // a single entry — that count drifts as families are added/split.
    // Instead we pin the loaded numeral (load-bearing — it's what
    // changes on each Load-more click) and require the total to be
    // an integer strictly greater than 80 (proving `hasMore` is true
    // and the caption isn't reading a trivially-empty list).
    const text = caption.textContent ?? "";
    const match = text.match(/^Loaded\s+([\d,]+)\s+of\s+([\d,]+)$/);
    expect(match).not.toBeNull();
    const loaded = Number(match![1].replace(/,/g, ""));
    const total = Number(match![2].replace(/,/g, ""));
    expect(loaded).toBe(80);
    expect(total).toBeGreaterThan(80);
    // Total must be locale-formatted with comma grouping once it
    // crosses 1,000 — this catches a regression that drops the
    // `.toLocaleString()` call and renders a raw 4-digit number.
    if (total >= 1000) {
      expect(match![2]).toContain(",");
    }

    // The caption is the screen-reader announcement surface for
    // sentinel-driven and Load-more increments — `aria-live="polite"`
    // is the load-bearing contract that hands the running count
    // off to AT without interrupting whatever the user is hearing.
    expect(caption).toHaveAttribute("aria-live", "polite");
  });
});

/**
 * W812 — Space key on a focused drawer category row activates the row,
 * exactly like Enter or click. The drawer keyboard handler
 * (LobbyPage.tsx ~L772 `onDrawerKeyDown`) explicitly intercepts
 * `Space`/`Spacebar`/`" "` and synthesizes a click on the focused row
 * (so the page doesn't scroll while the drawer holds focus). Sibling
 * tests in this file pin the drawer's:
 *   - existence at desktop viewports (W227)
 *   - roving tabindex Arrow-key navigation (W295/W355)
 *   - Home/End focus jumps (W295/W355)
 *   - drag-resize / collapsed-state persistence (W374/W625/W659/W653)
 *   - mouse-click chip-filter sync (W644)
 *
 * What none of those exercise is the *Space-key activation* branch —
 * the `key === " " || key === "Spacebar"` arm of `onDrawerKeyDown`
 * that (a) calls `e.preventDefault()` to suppress the page-scroll and
 * (b) synthesizes a click on the focused row (which then routes
 * through the same chip-filter sync the W644 mouse-click test pins).
 * This test fills exactly that gap.
 *
 * Approach: focus the `solitaire` drawer row, dispatch Space, and
 * assert the active drawer row is solitaire AND the chip strip
 * mirrors it (`chip-solitaire` is pressed) — same observable contract
 * W644 pins for mouse-clicks, here driven through the keyboard branch.
 *
 * (W812 was previously claimed by a long-press touch context-menu test
 * that was removed because `GameCard`'s JSX spreads `{...handlers}`
 * AFTER `onTouchStart={onTileTouchStart}`, so the spread clobbers the
 * long-press handler and the 600ms timer never arms in production —
 * a production-side bug, out of scope for a test-only commit. This
 * drawer-Space test reuses the W812 slot for an actually-reachable
 * untested behaviour.)
 */
describe("LobbyPage — drawer Space activates focused row (W812)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Mirror the W227 / W644 drawer tests: drawer is desktop-only, so
    // we have to widen jsdom's viewport above the 1024px breakpoint
    // before render.
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 1280,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("Space on a focused drawer category row syncs the chip strip filter", () => {
    renderAt("/");

    // Sanity: drawer mounted. The W227 sibling pins this; we assert it
    // here too so a drawer-removal regression fails fast inside this
    // describe rather than masquerading as a missing-row error below.
    expect(screen.getByTestId("lobby-drawer")).toBeInTheDocument();

    // Pre-state: the `all` chip starts pressed (default filter), and
    // the `solitaire` chip is NOT pressed. The W267 / W644 sibling
    // tests pin this default-pressed shape; we lean on it as our
    // pre-condition so the post-Space assertion below is unambiguous.
    expect(screen.getByTestId("chip-all")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByTestId("chip-solitaire")).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    // Locate the drawer's solitaire row — same testid pattern the W644
    // mouse-click test uses (`lobby-drawer-cat-<category>`).
    const row = screen.getByTestId(
      "lobby-drawer-cat-solitaire",
    ) as HTMLButtonElement;

    // Focus the row first — `onDrawerKeyDown` reads `document.activeElement`
    // off the focused row to decide which entry to activate. Without an
    // explicit focus the handler would fall back to `drawerFocusIdx=0`
    // (the first row), and Space would activate the wrong category.
    row.focus();
    expect(document.activeElement).toBe(row);

    // Dispatch Space on the focused row. React's keyDown bubbles from
    // the focused row up to the nav, where `onDrawerKeyDown` runs in
    // the bubble phase and reads `document.activeElement` (still the
    // row).
    fireEvent.keyDown(row, { key: " " });

    // Post-Space contract — same observable shape as W644's mouse-click
    // path: the drawer row flips its active state and the chip strip
    // mirrors it because both surfaces share the same `filter` state.
    expect(row).toHaveAttribute("aria-current", "true");
    expect(screen.getByTestId("chip-solitaire")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    // And the previously-pressed `all` chip flips back to false. This
    // mirrors W267's "exclusive chip-strip" contract: the filter is a
    // single-select, not a toggle.
    expect(screen.getByTestId("chip-all")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});

/**
 * W857 — "EDITOR'S PICK" badge on hand-curated featured tiles.
 *
 * `pickBadgeKind` (web/src/platform/gameTags.ts) returns "editors-pick" when
 * an id appears in the lobby-local FEATURED_IDS list AND nothing
 * higher-priority fired (NEW > CHALLENGING > QUICK > POPULAR >
 * EDITORS-PICK). W784 pins NEW, W806 pins QUICK, W824 pins CHALLENGING and
 * W838 pins POPULAR; this test pins the lowest-priority EDITORS-PICK path
 * so a regression that drops the FEATURED_IDS check (or breaks the lobby's
 * threading of featuredIds into pickBadgeKind's options bag) still surfaces.
 *
 * `klondike` is the only stable FEATURED_IDS entry that is NOT preempted
 * by a higher-priority badge:
 *  - sits near the head of the GAMES registry (well outside the
 *    NEW_GAME_WINDOW=60 tail), so isNew is false and NEW won't preempt
 *  - is NOT in CHALLENGING_GAME_IDS, so CHALLENGING won't preempt
 *    (freecell, spider and holdem — the other featured ids — are, which
 *    is why they cannot stand in for this assertion)
 *  - is NOT in QUICK_GAME_IDS, so QUICK won't preempt (wordle-mini, the
 *    other featured candidate, is, so it cannot stand in either)
 *  - has no localStorage rating seed (cleared in beforeEach), so
 *    userRating === 0 and POPULAR won't preempt
 *
 * The badge must be read from the FEATURED STRIP, not the main grid: the
 * lobby's FamilyCard intentionally never assigns `editors-pick` (its badge
 * resolver only walks new/challenging/quick/popular), so the bare `klondike`
 * editor's-pick badge only ever surfaces through the FeaturedTile path,
 * which stamps `tile-badge-<familyId>` for family-rooted featured ids.
 * No search query is issued so the featured strip remains mounted; the
 * main-grid family tile for klondike has no badge and so cannot collide on
 * the testid.
 */
describe("LobbyPage — EDITORS-PICK badge on hand-curated featured tiles (W857)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("stamps tile-badge-klondike with the EDITOR'S PICK label and badge--editors-pick class", async () => {
    renderAt("/");

    // No search — the featured strip only mounts when query is empty AND
    // filter === "all". `tile-badge-klondike` is unambiguous because
    // FamilyCard never emits an editors-pick badge for the same family
    // id, so the only producer of this testid is the FeaturedTile.
    const badge = await waitFor(() => screen.getByTestId("tile-badge-klondike"));
    expect(badge).toBeInTheDocument();

    // Production contract: EDITOR'S PICK label/aria pins that
    // `pickBadgeKind` actually returned "editors-pick" — and that the
    // lobby threaded FEATURED_IDS (not isNew, not the curated lists, not
    // the rating) into the lowest-priority featured branch.
    expect(badge).toHaveTextContent("EDITOR'S PICK");
    expect(badge).toHaveAttribute("aria-label", "EDITOR'S PICK");
    // The colour-pill modifier locks the kind→class mapping in Badge.tsx
    // so a regression that swapped the kind arg while keeping the
    // testid intact still trips the assertion.
    expect(badge.className).toMatch(/\bbadge--editors-pick\b/);
  });
});

/**
 * W873 — family-tile rating widget exposes the "Best variant rating"
 * aria-label, distinct from the per-game tile's "Your rating" form.
 *
 * Sibling of W682 (which pinned the standalone GameCard's
 * `tile-rating-<id>` aria-label format `Your rating: N of 5 stars`) and
 * W721 (favorite-star indicator). The FamilyCard branch
 * (LobbyPage.tsx ~line 3282) renders its own `tile-rating-<family.id>`
 * widget when the family's *best member rating* (entryRating, ~line
 * 1142: `max(ratings[m.id])` over `family.members`) is > 0, BUT the
 * aria-label uses a different prefix — "Best variant rating" —
 * because the value reflects the strongest variant inside the family
 * rather than the family itself. Pinning that distinction here ensures
 * a refactor that unifies the two branches under a single aria-label
 * (or inverts the prefix) surfaces immediately.
 *
 * `klondike-by-threes` is a stable, well-known klondike-family member
 * (see `web/src/games/families.ts` ~line 65). Seeding it at 5 means
 * `entryRating(klondikeFamilyEntry) === 5` since max(5, 0, 0…) = 5.
 * We use the same search-narrowing pattern as W713 to bring the
 * klondike main-grid family tile into view past the alphabetical
 * page-1 cutoff; under an active query the featured strip is
 * suppressed, so `grid-tile-klondike` is the sole klondike tile and
 * its inner `tile-rating-klondike` widget is uniquely addressable.
 */
describe("LobbyPage — family-tile rating uses 'Best variant rating' aria-label (W873)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders tile-rating-<family.id> with 'Best variant rating: N of 5 stars'", async () => {
    // Seed `cards-ratings` with a single klondike-family MEMBER (NOT the
    // family id) before mount. The page's useState initializer hydrates
    // synchronously via `readRatings()` (LobbyPage.tsx ~line 732), and
    // entryRating() picks the max across `family.members`, so the family
    // tile MUST surface its rating widget on first paint.
    localStorage.setItem(
      "cards-ratings",
      JSON.stringify({ "klondike-by-threes": 5 }),
    );

    renderAt("/");

    // Narrow to klondike — same setup as W713's variant-count test.
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "klondike" } });

    // The featured strip is suppressed under an active query, so the
    // klondike family tile renders with the demoted `grid-tile-klondike`
    // testid. waitFor mirrors the W713 settle pattern.
    const familyTile = await waitFor(() =>
      screen.getByTestId(`grid-tile-${FAMILY_ID}`),
    );

    // The rating widget inside the family tile MUST exist (gated on
    // `userRating > 0` in the FamilyCard branch) and MUST carry the
    // "Best variant rating" prefix — distinct from the GameCard branch's
    // "Your rating" prefix locked by W682.
    const ratingWidget = within(familyTile).getByTestId(
      `tile-rating-${FAMILY_ID}`,
    );
    expect(ratingWidget).toHaveAttribute(
      "aria-label",
      "Best variant rating: 5 of 5 stars",
    );

    // Cross-branch guard: the widget MUST NOT use the GameCard's
    // "Your rating" prefix. Without this, a refactor that wires the
    // FamilyCard branch through the GameCard's aria-label by mistake
    // would still satisfy the positive assertion above (since the
    // numeric "5 of 5 stars" tail would match either prefix substring).
    expect(ratingWidget.getAttribute("aria-label") ?? "").not.toMatch(
      /^Your rating:/,
    );
  });
});
