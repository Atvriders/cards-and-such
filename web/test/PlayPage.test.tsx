import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Hoisted test plugin definition. `vi.hoisted` runs before any imports,
// so the mocked registry below resolves to this deterministic plugin
// at module-load time — which is critical because PlayPage reads GAMES
// during its own module evaluation.
//
// Reducer increments/decrements a `count` field. Each transition
// returns a brand-new object so the reducer never returns the same
// reference (PlayPage skips undo bookkeeping when next === prev).
const { counterPlugin, winPlugin } = vi.hoisted(() => {
  type CounterState = { count: number };
  type CounterAction =
    | { type: "inc" }
    | { type: "dec" }
    | { type: "set"; value: number };
  const plugin = {
    id: "test-undo-game",
    title: "Undo Test Game",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Deterministic counter for undo/redo tests.",
    settings: {},
    initialState: (): CounterState => ({ count: 0 }),
    reducer: (s: CounterState, a: CounterAction): CounterState => {
      if (a.type === "inc") return { count: s.count + 1 };
      if (a.type === "dec") return { count: s.count - 1 };
      if (a.type === "set") return { count: a.value };
      return s;
    },
    isTerminal: () => null,
    component: ({
      state,
      dispatch,
    }: {
      state: CounterState;
      dispatch: (a: CounterAction) => void;
    }) => (
      <div>
        <span data-testid="counter-value">{state.count}</span>
        <button data-testid="counter-inc" onClick={() => dispatch({ type: "inc" })}>
          inc
        </button>
        <button data-testid="counter-dec" onClick={() => dispatch({ type: "dec" })}>
          dec
        </button>
        <input data-testid="counter-input" defaultValue="" />
      </div>
    ),
  };
  // Companion plugin for achievement-toast tests (W396). Same counter
  // reducer, but `isTerminal` returns a positive-score win as soon as
  // the count reaches 1 — so a single "inc" click drives PlayPage all
  // the way through the win-flow and into recordWithAchievementToast.
  const win = {
    id: "test-win-game",
    title: "Win Test Game",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Deterministic counter that wins on first increment.",
    settings: {},
    initialState: (): CounterState => ({ count: 0 }),
    reducer: (s: CounterState, a: CounterAction): CounterState => {
      if (a.type === "inc") return { count: s.count + 1 };
      if (a.type === "dec") return { count: s.count - 1 };
      if (a.type === "set") return { count: a.value };
      return s;
    },
    isTerminal: (s: CounterState) => (s.count >= 1 ? { score: 1 } : null),
    component: ({
      state,
      dispatch,
    }: {
      state: CounterState;
      dispatch: (a: CounterAction) => void;
    }) => (
      <div>
        <span data-testid="win-counter-value">{state.count}</span>
        <button data-testid="win-counter-inc" onClick={() => dispatch({ type: "inc" })}>
          inc
        </button>
      </div>
    ),
  };
  return { counterPlugin: plugin, winPlugin: win };
});

vi.mock("../src/games/registry.js", () => ({
  GAMES: [counterPlugin, winPlugin],
}));

// Stub the score-submit fetch so the win flow doesn't fire a relative-URL
// fetch that jsdom can't resolve (which surfaces as a noisy "unhandled
// rejection" warning even though the call is fire-and-forget).
vi.mock("../src/platform/game-plugin/submitScore.js", () => ({
  submitScore: vi.fn(async () => {}),
}));

import App from "../src/App.js";
import { useAuth } from "../src/platform/stores/auth.js";
import { StatsPanel } from "../src/platform/StatsPanel.js";

describe("PlayPage", () => {
  it("renders not-found for unknown game id", () => {
    useAuth.setState({ username: "alice", token: "t.t.t", expiresAt: Date.now() + 1000 * 60 });
    render(
      <MemoryRouter initialEntries={["/play/does-not-exist"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("game-not-found")).toBeInTheDocument();
  });
});

describe("StatsPanel", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders zeros for an unplayed game", () => {
    render(<StatsPanel gameId="klondike" bestTime={null} />);
    expect(screen.getByTestId("stats-panel")).toBeInTheDocument();
    expect(screen.getByTestId("stats-played")).toHaveTextContent("0");
    expect(screen.getByTestId("stats-best")).toHaveTextContent("0");
    expect(screen.getByTestId("stats-win-rate")).toHaveTextContent("–");
    expect(screen.queryByTestId("stats-best-time")).toBeNull();
    expect(screen.queryByTestId("stats-rating")).toBeNull();
  });

  it("reads stats, best time, and rating from localStorage", () => {
    localStorage.setItem(
      "cards-and-such:stats:v1",
      JSON.stringify({
        totalPlayed: 4,
        totalWins: 3,
        longestStreak: 0,
        currentStreak: 0,
        perGame: { klondike: { played: 4, wins: 3, best: 720 } },
        perCategory: {},
        daysPlayed: [],
        unlocked: [],
      }),
    );
    localStorage.setItem("cards-ratings", JSON.stringify({ klondike: 4 }));
    render(<StatsPanel gameId="klondike" bestTime={123} />);
    expect(screen.getByTestId("stats-played")).toHaveTextContent("4");
    expect(screen.getByTestId("stats-best")).toHaveTextContent("720");
    expect(screen.getByTestId("stats-win-rate")).toHaveTextContent("75%");
    expect(screen.getByTestId("stats-best-time")).toHaveTextContent("02:03");
    expect(screen.getByTestId("stats-rating")).toHaveTextContent("★★★★☆");
  });

  it("collapses and expands via toggle", () => {
    render(<StatsPanel gameId="klondike" bestTime={null} />);
    expect(screen.getByTestId("stats-played")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("stats-panel-toggle"));
    expect(screen.queryByTestId("stats-played")).toBeNull();
    fireEvent.click(screen.getByTestId("stats-panel-toggle"));
    expect(screen.getByTestId("stats-played")).toBeInTheDocument();
  });

  it("requires confirmation before resetting and clears stored values", () => {
    localStorage.setItem(
      "cards-and-such:stats:v1",
      JSON.stringify({
        totalPlayed: 2,
        totalWins: 1,
        longestStreak: 0,
        currentStreak: 0,
        perGame: { klondike: { played: 2, wins: 1, best: 50 } },
        perCategory: {},
        daysPlayed: [],
        unlocked: [],
      }),
    );
    localStorage.setItem("cards-best-times", JSON.stringify({ klondike: 99 }));
    localStorage.setItem("cards-ratings", JSON.stringify({ klondike: 5 }));

    render(<StatsPanel gameId="klondike" bestTime={99} />);
    expect(screen.getByTestId("stats-played")).toHaveTextContent("2");

    // First click arms the confirmation
    fireEvent.click(screen.getByTestId("stats-panel-reset"));
    expect(screen.getByTestId("stats-panel-reset")).toHaveTextContent(/confirm/i);
    expect(screen.getByTestId("stats-panel-cancel")).toBeInTheDocument();

    // Cancel returns to default state without clearing
    fireEvent.click(screen.getByTestId("stats-panel-cancel"));
    expect(screen.getByTestId("stats-panel-reset")).toHaveTextContent("Reset stats");
    expect(JSON.parse(localStorage.getItem("cards-ratings") ?? "{}").klondike).toBe(5);

    // Confirm clears stored values
    fireEvent.click(screen.getByTestId("stats-panel-reset"));
    fireEvent.click(screen.getByTestId("stats-panel-reset"));
    expect(screen.getByTestId("stats-played")).toHaveTextContent("0");
    expect(JSON.parse(localStorage.getItem("cards-ratings") ?? "{}").klondike).toBeUndefined();
    expect(JSON.parse(localStorage.getItem("cards-best-times") ?? "{}").klondike).toBeUndefined();
    const stats = JSON.parse(localStorage.getItem("cards-and-such:stats:v1") ?? "{}");
    expect(stats.perGame.klondike).toBeUndefined();
  });
});

/**
 * Undo / redo invariants for PlayPage. We render the full app at the
 * test plugin's route, click Start to enter the "playing" phase, then
 * exercise the unified undo stack via both the toolbar buttons and
 * window-level keyboard handlers.
 *
 * The mocked registry above contains exactly one plugin (`test-undo-game`)
 * with a deterministic counter reducer, so state is trivial to assert.
 * UNDO_STACK_CAP in PlayPage.tsx is 20 — the cap test relies on that.
 */
describe("PlayPage undo/redo", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuth.setState({
      username: "alice",
      token: "t.t.t",
      expiresAt: Date.now() + 1000 * 60,
    });
  });

  /** Mount PlayPage at the test plugin and click "Start playing" so phase
   *  becomes "playing". Returns a getter for the rendered counter value. */
  function mountAndStart(): { getCount: () => number } {
    render(
      <MemoryRouter initialEntries={["/play/test-undo-game"]}>
        <App />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("start-game"));
    return {
      getCount: () => Number(screen.getByTestId("counter-value").textContent ?? "0"),
    };
  }

  it("undo pops and redo pushes back across two ping-pongs", () => {
    const { getCount } = mountAndStart();

    fireEvent.click(screen.getByTestId("counter-inc")); // 1
    fireEvent.click(screen.getByTestId("counter-inc")); // 2
    expect(getCount()).toBe(2);

    // ping-pong #1
    fireEvent.click(screen.getByTestId("play-undo-btn"));
    expect(getCount()).toBe(1);
    fireEvent.click(screen.getByTestId("play-redo-btn"));
    expect(getCount()).toBe(2);

    // ping-pong #2
    fireEvent.click(screen.getByTestId("play-undo-btn"));
    expect(getCount()).toBe(1);
    fireEvent.click(screen.getByTestId("play-redo-btn"));
    expect(getCount()).toBe(2);

    // Both should still be enabled (1 frame on undo stack, 0 on redo).
    fireEvent.click(screen.getByTestId("play-undo-btn"));
    expect(getCount()).toBe(1);
    expect(screen.getByTestId("play-undo-btn")).toBeEnabled();
    expect(screen.getByTestId("play-redo-btn")).toBeEnabled();
  });

  it("a fresh dispatch clears the redo stack", () => {
    const { getCount } = mountAndStart();

    fireEvent.click(screen.getByTestId("counter-inc")); // 1
    fireEvent.click(screen.getByTestId("counter-inc")); // 2
    fireEvent.click(screen.getByTestId("play-undo-btn")); // 1, redo stack has one frame
    expect(screen.getByTestId("play-redo-btn")).toBeEnabled();

    // A brand-new action branches the timeline; redo stack must be wiped.
    fireEvent.click(screen.getByTestId("counter-dec")); // 0
    expect(getCount()).toBe(0);
    expect(screen.getByTestId("play-redo-btn")).toBeDisabled();
  });

  it("Ctrl+Z triggers undo and Ctrl+Shift+Z triggers redo from the page-level handler", () => {
    const { getCount } = mountAndStart();

    fireEvent.click(screen.getByTestId("counter-inc")); // 1
    fireEvent.click(screen.getByTestId("counter-inc")); // 2

    // Listener is bound on `window`. Dispatch a real KeyboardEvent so
    // the handler's ctrlKey/shiftKey/key checks resolve.
    fireEvent.keyDown(window, { key: "z", code: "KeyZ", ctrlKey: true });
    expect(getCount()).toBe(1);

    fireEvent.keyDown(window, {
      key: "z",
      code: "KeyZ",
      ctrlKey: true,
      shiftKey: true,
    });
    expect(getCount()).toBe(2);
  });

  it("Ctrl+Z while focused on an input is a no-op for the page-level handler", () => {
    const { getCount } = mountAndStart();

    fireEvent.click(screen.getByTestId("counter-inc")); // 1
    fireEvent.click(screen.getByTestId("counter-inc")); // 2

    // Fire keydown directly at the input. PlayPage's handler bails when
    // event.target is an INPUT tag so the user gets the browser's native
    // text-undo instead of a game rollback.
    const input = screen.getByTestId("counter-input");
    input.focus();
    fireEvent.keyDown(input, { key: "z", code: "KeyZ", ctrlKey: true });
    expect(getCount()).toBe(2);

    // Confirm the page-level handler still works once focus leaves the input.
    fireEvent.keyDown(window, { key: "z", code: "KeyZ", ctrlKey: true });
    expect(getCount()).toBe(1);
  });

  it("clicking the undo button pops the most recent frame off the stack", () => {
    // The keyboard-handler test above covers Ctrl+Z; this asserts the
    // toolbar button itself (not just the global listener) is wired to
    // `undo()` and rolls state back by exactly one frame per click.
    const { getCount } = mountAndStart();

    fireEvent.click(screen.getByTestId("counter-inc")); // 1
    fireEvent.click(screen.getByTestId("counter-inc")); // 2
    fireEvent.click(screen.getByTestId("counter-inc")); // 3
    expect(getCount()).toBe(3);

    fireEvent.click(screen.getByTestId("play-undo-btn"));
    expect(getCount()).toBe(2);
    fireEvent.click(screen.getByTestId("play-undo-btn"));
    expect(getCount()).toBe(1);
  });

  it("'Show undo count' toggle in settings updates the Undo (N) label live", () => {
    // Default off → no count label is rendered. Toggling the
    // Settings → Gameplay flag and dispatching a `storage` event
    // (the cross-tab/page sync mechanism PlayPage subscribes to) must
    // surface a "Undo (N)" label that mirrors the current stack depth.
    const { getCount } = mountAndStart();

    fireEvent.click(screen.getByTestId("counter-inc")); // 1
    fireEvent.click(screen.getByTestId("counter-inc")); // 2
    expect(getCount()).toBe(2);
    expect(screen.queryByTestId("play-undo-btn-label")).toBeNull();

    // Flip the preference and notify listeners exactly the way the
    // browser would for a write that came from a different document.
    localStorage.setItem("cards-show-undo-count", "true");
    fireEvent(
      window,
      new StorageEvent("storage", { key: "cards-show-undo-count", newValue: "true" }),
    );

    const label = screen.getByTestId("play-undo-btn-label");
    expect(label).toHaveTextContent("Undo (2)");

    // And the label tracks subsequent stack changes — undo once and the
    // count must drop to 1 without a remount.
    fireEvent.click(screen.getByTestId("play-undo-btn"));
    expect(screen.getByTestId("play-undo-btn-label")).toHaveTextContent("Undo (1)");
  });

  it("undo cap drops the oldest frame after more than 20 actions", () => {
    const { getCount } = mountAndStart();

    // 25 increments → state count = 25, but only the most recent 20
    // prior states are retained (UNDO_STACK_CAP = 20). Undoing 20 times
    // should land at count = 5; the 21st undo must be a no-op because
    // that frame was dropped.
    const incBtn = screen.getByTestId("counter-inc");
    for (let i = 0; i < 25; i++) fireEvent.click(incBtn);
    expect(getCount()).toBe(25);

    const undoBtn = screen.getByTestId("play-undo-btn");
    for (let i = 0; i < 20; i++) fireEvent.click(undoBtn);
    expect(getCount()).toBe(5);

    // Stack now empty — button must be disabled and another click is a no-op.
    expect(undoBtn).toBeDisabled();
    fireEvent.click(undoBtn);
    expect(getCount()).toBe(5);
  });
});

/**
 * Session info popover (W164). The button lives in the play header and
 * is wired to a `role="dialog"` popover that surfaces seed, session start
 * time, and plays-this-session counter, plus a focus-trap and Esc-to-close.
 *
 * Reuses the hoisted `counterPlugin` registry mock above so PlayPage mounts
 * deterministically with a known seed/session shape.
 */
describe("PlayPage info popover", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuth.setState({
      username: "alice",
      token: "t.t.t",
      expiresAt: Date.now() + 1000 * 60,
    });
  });

  function mountPlayPage(): void {
    render(
      <MemoryRouter initialEntries={["/play/test-undo-game"]}>
        <App />
      </MemoryRouter>,
    );
  }

  it("opens on click and shows seed, start-time, and plays-this-session rows", () => {
    mountPlayPage();
    expect(screen.queryByTestId("play-info-popover")).toBeNull();

    fireEvent.click(screen.getByTestId("play-info-btn"));

    const popover = screen.getByTestId("play-info-popover");
    expect(popover).toBeInTheDocument();
    expect(popover).toHaveTextContent("Seed");
    expect(popover).toHaveTextContent("Started");
    expect(popover).toHaveTextContent("Plays this session");
  });

  it("traps focus inside the popover when opened", () => {
    mountPlayPage();
    fireEvent.click(screen.getByTestId("play-info-btn"));

    const popover = screen.getByTestId("play-info-popover");
    // The trap moves focus into the popover on activation — the active
    // element should now be the first focusable inside (or the popover
    // itself if no focusables existed). The Close button always exists.
    expect(popover.contains(document.activeElement)).toBe(true);

    // Tab from the last focusable wraps back to the first — that's the
    // observable focus-trap invariant. Find the last focusable, focus it,
    // then dispatch Tab and confirm focus stayed inside the popover.
    const focusables = popover.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const last = focusables[focusables.length - 1]!;
    last.focus();
    expect(document.activeElement).toBe(last);

    // The trap listens at capture phase on document. fireEvent.keyDown on
    // the focused element bubbles up through document, hitting that listener.
    fireEvent.keyDown(last, { key: "Tab", code: "Tab" });
    expect(popover.contains(document.activeElement)).toBe(true);
  });

  it("closes when Escape is pressed and restores focus to the trigger", () => {
    mountPlayPage();
    const trigger = screen.getByTestId("play-info-btn");
    fireEvent.click(trigger);
    expect(screen.getByTestId("play-info-popover")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape", code: "Escape" });

    expect(screen.queryByTestId("play-info-popover")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});

/**
 * Achievement-unlock toast on the play page (W396). When a finished
 * round causes one or more achievements to cross their unlock
 * threshold, PlayPage surfaces a celebratory `play-achievement-toast`
 * that names the unlocked achievement.
 *
 * The hoisted `winPlugin` above wins on the first `inc` action, so
 * starting with seeded stats that have zero wins / zero unlocks lets a
 * single click cross the "First Win" threshold deterministically.
 */
describe("PlayPage achievement toast", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuth.setState({
      username: "alice",
      token: "t.t.t",
      expiresAt: Date.now() + 1000 * 60,
    });
    // Seed an empty stats blob so `unlocked` is definitely [] before
    // the win flow runs — guarantees the "first-win" predicate flips
    // from unmet to met during recordGame, which is what triggers the
    // toast diff in recordWithAchievementToast.
    localStorage.setItem(
      "cards-and-such:stats:v1",
      JSON.stringify({
        totalPlayed: 0,
        totalWins: 0,
        longestStreak: 0,
        currentStreak: 0,
        perGame: {},
        perCategory: {},
        daysPlayed: [],
        unlocked: [],
      }),
    );
  });

  function mountWinGame(): void {
    render(
      <MemoryRouter initialEntries={["/play/test-win-game"]}>
        <App />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("start-game"));
  }

  it("shows the play-achievement-toast naming the unlock when a win crosses the first-win threshold", () => {
    mountWinGame();
    expect(screen.queryByTestId("play-achievement-toast")).toBeNull();

    // Single inc — winPlugin.isTerminal returns { score: 1 } at count >= 1,
    // so PlayPage runs the win flow and recordGame flips "first-win" to
    // unlocked, which surfaces the play-page-scoped toast.
    fireEvent.click(screen.getByTestId("win-counter-inc"));

    const toast = screen.getByTestId("play-achievement-toast");
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveTextContent(/Achievement unlocked: First Win/i);
  });

  it("does not show the toast when the unlock was already recorded before this play", () => {
    // Pre-record the first-win unlock so the diff between before/after
    // unlocked sets is empty — recordWithAchievementToast must bail out
    // and leave the toast unmounted.
    localStorage.setItem(
      "cards-and-such:stats:v1",
      JSON.stringify({
        totalPlayed: 1,
        totalWins: 1,
        longestStreak: 1,
        currentStreak: 1,
        perGame: { "test-win-game": { played: 1, wins: 1, best: 1 } },
        perCategory: { cards: 1 },
        daysPlayed: ["1970-01-01"],
        unlocked: ["first-win"],
      }),
    );

    mountWinGame();
    fireEvent.click(screen.getByTestId("win-counter-inc"));

    expect(screen.queryByTestId("play-achievement-toast")).toBeNull();
  });
});

/**
 * W581 — Share-seed button copies a deep link to the clipboard. Reuses the
 * hoisted `counterPlugin` registry mock so PlayPage mounts deterministically,
 * with a `?seed=42` param so the URL placed on the clipboard is predictable.
 *
 * Stubs navigator.clipboard.writeText to capture the call (jsdom ships no
 * Clipboard API by default) and asserts both the URL shape — `${origin}/play/
 * <id>?seed=<seed>` — and that the toolbar surfaces the "Copied!" affordance
 * via the button's data-tooltip after a successful write.
 */
describe("PlayPage seed share", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuth.setState({
      username: "alice",
      token: "t.t.t",
      expiresAt: Date.now() + 1000 * 60,
    });
  });

  it("clicking share-seed-btn copies the deep link to the clipboard and surfaces the Copied affordance", async () => {
    const writeText = vi.fn(async () => {});
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(
      <MemoryRouter initialEntries={["/play/test-undo-game?seed=42"]}>
        <App />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("share-seed-btn");
    fireEvent.click(btn);

    // shareSeed is async — wait for writeText + the setShareStatus("copied")
    // commit to flush before asserting on the toolbar's "Copied!" affordance.
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledTimes(1);
    });
    expect(writeText).toHaveBeenCalledWith(
      `${window.location.origin}/play/test-undo-game?seed=42`,
    );
    await waitFor(() => {
      expect(screen.getByTestId("share-seed-btn")).toHaveAttribute(
        "data-tooltip",
        "Copied!",
      );
    });
  });
});
