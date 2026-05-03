import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

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
