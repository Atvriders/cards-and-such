import { fireEvent, render, screen } from "@testing-library/react";
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
const { counterPlugin } = vi.hoisted(() => {
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
  return { counterPlugin: plugin };
});

vi.mock("../src/games/registry.js", () => ({
  GAMES: [counterPlugin],
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
