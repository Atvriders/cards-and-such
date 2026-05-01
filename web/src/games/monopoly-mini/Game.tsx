import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MonopolyState, MonopolyAction, MonopolySettings, Square } from "./state.js";
import { isTerminal, score, BOARD, MAX_TURNS } from "./state.js";
import "./Game.css";

// 5x5 CSS grid placement for the 16-square outer ring. Each entry is the board index for that grid cell;
// `null` cells are the inner 3x3 area where the HUD lives.
// Visual order matches a real Monopoly board:
//   bottom-right corner = GO (0), bottom row right->left, JAIL bottom-left (4),
//   left column bottom->top, FREE PARKING top-left (8), top row left->right,
//   GO TO JAIL top-right (12), right column top->bottom.
const GRID_CELLS: ReadonlyArray<{ row: number; col: number; idx: number | null; cornerKey?: string }> = [
  // Top row (row 1): FREE PARKING, top properties, GO TO JAIL
  { row: 1, col: 1, idx: 8,  cornerKey: "tl" },
  { row: 1, col: 2, idx: 9 },
  { row: 1, col: 3, idx: 10 },
  { row: 1, col: 4, idx: 11 },
  { row: 1, col: 5, idx: 12, cornerKey: "tr" },
  // Right column (rows 2..4): top->bottom
  { row: 2, col: 5, idx: 13 },
  { row: 3, col: 5, idx: 14 },
  { row: 4, col: 5, idx: 15 },
  // Bottom row (row 5): JAIL, bottom properties, GO
  { row: 5, col: 5, idx: 0,  cornerKey: "br" },
  { row: 5, col: 4, idx: 1 },
  { row: 5, col: 3, idx: 2 },
  { row: 5, col: 2, idx: 3 },
  { row: 5, col: 1, idx: 4,  cornerKey: "bl" },
  // Left column (rows 4..2): bottom->top
  { row: 4, col: 1, idx: 5 },
  { row: 3, col: 1, idx: 6 },
  { row: 2, col: 1, idx: 7 },
];

const COLOR_HEX: Record<string, string> = {
  brown: "#8b4513",
  lightblue: "#aae0fa",
  pink: "#d93a96",
  orange: "#f7941d",
  red: "#ed1b24",
  yellow: "#fef200",
  green: "#1fb25a",
  blue: "#0072bb",
};

function DiePip({ value }: { value: number }): JSX.Element {
  // 9-position pip layout. Each cell either has a pip or doesn't.
  const PATTERNS: Record<number, ReadonlyArray<number>> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };
  const set = new Set(PATTERNS[value] ?? []);
  return (
    <div className="monopolymini-die" aria-label={`die ${value}`}>
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className={"monopolymini-pip" + (set.has(i) ? " on" : "")} />
      ))}
    </div>
  );
}

function squareSubtitle(sq: Square): string {
  if (sq.type === "property") return `$${sq.price}`;
  if (sq.type === "railroad") return `$${sq.price}`;
  if (sq.type === "tax") return `Pay $${sq.rent}`;
  if (sq.type === "chance") return "?";
  return "";
}

function cornerLabel(sq: Square): string {
  if (sq.type === "go") return "GO";
  if (sq.type === "jail") return "JAIL";
  if (sq.type === "free") return "FREE";
  if (sq.type === "gotojail") return "GO TO JAIL";
  return sq.short;
}

export function MonopolyMiniGame({ state, dispatch, onGameOver }: GameProps<MonopolyState, MonopolySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (state.phase === "rolling" && state.isPlayer && (e.key === "r" || e.key === "R" || e.key === " ")) {
        e.preventDefault(); dispatch({ type: "roll" } as MonopolyAction);
      } else if (state.phase === "deciding") {
        if (e.key === "b" || e.key === "B") { e.preventDefault(); dispatch({ type: "buy" } as MonopolyAction); }
        else if (e.key === "s" || e.key === "S") { e.preventDefault(); dispatch({ type: "skip" } as MonopolyAction); }
      } else if (state.phase === "ai" && (e.key === "Enter" || e.key === "n" || e.key === "N")) {
        e.preventDefault(); dispatch({ type: "ai" } as MonopolyAction);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch, state.phase, state.isPlayer]);

  const pSq = BOARD[state.pPos]!;
  const cSq = BOARD[state.cPos]!;
  const recentLog = state.log.slice(-4);

  return (
    <div className="monopolymini-wrap">
      <div className="monopolymini-hud-top">
        <div className="monopolymini-stat">
          <span className="monopolymini-stat-label">Turn</span>
          <span className="monopolymini-stat-value">{state.turn}/{MAX_TURNS}</span>
        </div>
        <div className="monopolymini-stat monopolymini-stat-you">
          <span className="monopolymini-stat-label">You</span>
          <span className="monopolymini-stat-value monopolymini-money">${state.pCash}</span>
        </div>
        <div className="monopolymini-stat monopolymini-stat-cpu">
          <span className="monopolymini-stat-label">CPU</span>
          <span className="monopolymini-stat-value monopolymini-money">${state.cCash}</span>
        </div>
      </div>

      <div className="monopolymini-board" role="grid" aria-label="Monopoly board">
        {GRID_CELLS.map(({ row, col, idx, cornerKey }) => {
          if (idx === null) return null;
          const sq = BOARD[idx]!;
          const own = state.owners[idx]!;
          const isCorner = cornerKey !== undefined;
          const isProperty = sq.type === "property" || sq.type === "railroad";
          const stripeStyle: React.CSSProperties =
            sq.color ? { background: COLOR_HEX[sq.color] } :
            sq.type === "railroad" ? { background: "#222" } :
            { display: "none" };
          // Stripe orientation: top stripe for top row, bottom for bottom row,
          // left for left column, right for right column.
          const stripeSide =
            row === 1 ? "bottom" :
            row === 5 ? "top" :
            col === 1 ? "right" :
            col === 5 ? "left" : "top";
          const cls = [
            "monopolymini-sq",
            `monopolymini-sq-${sq.type}`,
            isCorner ? `monopolymini-corner monopolymini-corner-${cornerKey}` : "",
            own !== "none" ? `monopolymini-owned-${own}` : "",
            state.pPos === idx ? "monopolymini-here-p" : "",
            state.cPos === idx ? "monopolymini-here-c" : "",
          ].filter(Boolean).join(" ");
          return (
            <div
              key={idx}
              className={cls}
              style={{ gridRow: row, gridColumn: col }}
              role="gridcell"
              aria-label={`${sq.name}${own === "p" ? " (yours)" : own === "c" ? " (CPU)" : ""}`}
            >
              {isProperty && (
                <span
                  className={`monopolymini-stripe monopolymini-stripe-${stripeSide}`}
                  style={stripeStyle}
                />
              )}
              <div className="monopolymini-sq-body">
                {isCorner ? (
                  <>
                    <div className="monopolymini-corner-label">{cornerLabel(sq)}</div>
                    {sq.type === "jail" && <div className="monopolymini-corner-sub">Just Visiting</div>}
                  </>
                ) : sq.type === "chance" ? (
                  <>
                    <div className="monopolymini-chance-mark">?</div>
                    <div className="monopolymini-sq-name">Chance</div>
                  </>
                ) : sq.type === "tax" ? (
                  <>
                    <div className="monopolymini-sq-name">Income Tax</div>
                    <div className="monopolymini-sq-sub">Pay $75</div>
                  </>
                ) : sq.type === "railroad" ? (
                  <>
                    <div className="monopolymini-rr-icon" aria-hidden="true">{"◆"}</div>
                    <div className="monopolymini-sq-name">{sq.name}</div>
                    <div className="monopolymini-sq-sub">{squareSubtitle(sq)}</div>
                  </>
                ) : (
                  <>
                    <div className="monopolymini-sq-name">{sq.name}</div>
                    <div className="monopolymini-sq-sub">{squareSubtitle(sq)}</div>
                  </>
                )}
                <div className="monopolymini-tokens">
                  {state.pPos === idx && <span className="monopolymini-tok monopolymini-tok-p" title="You">P</span>}
                  {state.cPos === idx && <span className="monopolymini-tok monopolymini-tok-c" title="CPU">C</span>}
                </div>
                {own !== "none" && (
                  <span className={`monopolymini-deed monopolymini-deed-${own}`} title={`${own === "p" ? "You" : "CPU"} owns this`}>
                    {own === "p" ? "P" : "C"}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Center HUD: title + dice + log */}
        <div className="monopolymini-center" style={{ gridRow: "2 / span 3", gridColumn: "2 / span 3" }}>
          <div className="monopolymini-title">MONOPOLY <span>mini</span></div>
          <div className="monopolymini-dice-row" aria-live="polite">
            {state.dice ? (
              <>
                <DiePip value={state.dice[0]} />
                <DiePip value={state.dice[1]} />
                <div className="monopolymini-dice-sum">
                  = <strong>{state.dice[0] + state.dice[1]}</strong>
                  {state.dice[0] === state.dice[1] && <span className="monopolymini-doubles">DOUBLES</span>}
                </div>
              </>
            ) : (
              <div className="monopolymini-dice-placeholder">Roll the dice</div>
            )}
          </div>
          <div className="monopolymini-log" aria-label="Recent events">
            {recentLog.map((line, i) => (
              <div key={state.log.length - recentLog.length + i} className="monopolymini-log-line">{line}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="monopolymini-message" aria-live="polite">{state.message}</div>

      <div className="monopolymini-actions">
        {state.phase === "rolling" && state.isPlayer && (
          <button
            className="monopolymini-btn monopolymini-btn-primary"
            aria-label="Roll Dice (R)"
            onClick={() => dispatch({ type: "roll" } as MonopolyAction)}
          >
            Roll Dice
          </button>
        )}
        {state.phase === "deciding" && (
          <>
            <button
              className="monopolymini-btn monopolymini-btn-buy"
              onClick={() => dispatch({ type: "buy" } as MonopolyAction)}
              disabled={state.pCash < (BOARD[state.pPos]!.price)}
            >
              Buy {BOARD[state.pPos]!.name} (${BOARD[state.pPos]!.price})
            </button>
            <button
              className="monopolymini-btn monopolymini-btn-skip"
              onClick={() => dispatch({ type: "skip" } as MonopolyAction)}
            >
              Skip
            </button>
          </>
        )}
        {state.phase === "ai" && (
          <button
            className="monopolymini-btn monopolymini-btn-cpu"
            onClick={() => dispatch({ type: "ai" } as MonopolyAction)}
          >
            End Turn (CPU rolls)
          </button>
        )}
        {state.phase === "done" && (
          <div className="monopolymini-done">
            <div className="monopolymini-done-msg">{state.message}</div>
            <div className="monopolymini-done-score">Score: <strong>{score(state)}</strong></div>
          </div>
        )}
      </div>

      {/* Live position summary for accessibility/clarity */}
      <div className="monopolymini-positions">
        <span className="monopolymini-pos monopolymini-pos-p">You at {pSq.name}{state.pInJail ? " (in jail)" : ""}</span>
        <span className="monopolymini-pos monopolymini-pos-c">CPU at {cSq.name}{state.cInJail ? " (in jail)" : ""}</span>
      </div>
    </div>
  );
}

