import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

// W579 — capture navigate() calls so the surprise-me button test can assert
// the destination URL shape without mounting a real /play/<id> route. Other
// describe blocks in this file never trigger navigate(), so the spy is a
// no-op for them.
const navigateSpy = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return {
    ...actual,
    useNavigate: () => navigateSpy,
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
});
