import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import {
  BOARD,
  BOARD_LEN,
  CAGE_TRACK,
  CHEESE_WHEEL_SQUARE,
  NUM_PLAYERS,
  PART_NAMES,
  isTerminal,
  reducer,
  type MouseTrapFullAction,
  type MouseTrapFullSettings,
  type MouseTrapFullState,
} from "./state.js";
import "./Game.css";

const PLAYER_COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12"];
const PLAYER_LABELS = ["You", "CPU 1", "CPU 2", "CPU 3"];

const CAGE_SET = new Set(CAGE_TRACK);

/** Map a square index to a coordinate on the perimeter of a 7×7 grid
 *  (so the 24 squares form a visible loop around the trap area). */
function squareToGrid(i: number): { row: number; col: number } {
  // 24 perimeter cells of a 7×7 grid → 6 across the top + 6 down right + 6 across bottom + 6 up left.
  const idx = ((i % BOARD_LEN) + BOARD_LEN) % BOARD_LEN;
  if (idx < 6) return { row: 0, col: idx };
  if (idx < 12) return { row: idx - 6, col: 6 };
  if (idx < 18) return { row: 6, col: 6 - (idx - 12) };
  return { row: 6 - (idx - 18), col: 0 };
}

export function MouseTrapFullGame(
  props: GameProps<MouseTrapFullState, MouseTrapFullSettings>,
): JSX.Element {
  const { state, dispatch, onGameOver } = props;
  const terminal = isTerminal(state);

  // Fire onGameOver exactly once.
  const endedRef = useRef(false);
  useEffect(() => {
    if (terminal && !endedRef.current) {
      endedRef.current = true;
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  // Auto-step CPUs so the human isn't clicking through bot moves.
  // We dispatch one cpu-step per render-tick when it's a CPU's turn.
  useEffect(() => {
    if (state.phase === "done") return;
    if (state.current === 0) return;
    if (state.phase === "rolling") {
      const id = window.setTimeout(() => {
        dispatch({ type: "cpu-step" } satisfies MouseTrapFullAction);
      }, 480);
      return () => window.clearTimeout(id);
    }
    return;
  }, [state.current, state.phase, dispatch]);

  const canRoll = state.phase === "rolling" && state.current === 0 && state.winner === null;
  const canNext = state.phase === "resolved" && state.current === 0 && state.winner === null;
  const partsBuiltCount = state.partsBuilt.filter(Boolean).length;

  return (
    <div className="mtf-game fade-in">
      <div className="mtf-header">
        <div className="mtf-title">Mouse Trap (Full Build)</div>
        <div className="mtf-stats">
          <span className={`mtf-stat ${state.armed ? "mtf-armed" : ""}`}>
            Parts {partsBuiltCount}/{PART_NAMES.length} {state.armed ? "· ARMED" : ""}
          </span>
          <span className="mtf-stat pulse">Turn {state.turn}</span>
        </div>
      </div>

      <div className="mtf-status">
        {state.winner !== null ? (
          <div className={`mtf-winner ${state.winner === 0 ? "win" : "loss"}`}>
            {state.winner === 0
              ? "You survived! Score = " + (terminal?.score ?? 0)
              : `${PLAYER_LABELS[state.winner]} wins. Score = ${terminal?.score ?? 0}`}
          </div>
        ) : (
          <div className="mtf-turn">
            {state.current === 0 ? "Your turn." : `${PLAYER_LABELS[state.current]}'s turn…`}
            {state.lastRoll !== null && (
              <span className="mtf-roll" title={`Last roll: ${state.lastRoll}`}>
                d6={state.lastRoll}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mtf-controls">
        <button
          className="mtf-btn mtf-btn-primary"
          data-testid="hint-target-mouse-trap-full-roll"
          onClick={() => dispatch({ type: "roll" } satisfies MouseTrapFullAction)}
          disabled={!canRoll}
          title="Roll a six-sided die to move your mouse"
        >
          Roll d6
        </button>
        <button
          className="mtf-btn"
          data-testid="hint-target-mouse-trap-full-next"
          onClick={() => dispatch({ type: "next" } satisfies MouseTrapFullAction)}
          disabled={!canNext}
          title="End your turn and pass the dice"
        >
          End Turn
        </button>
      </div>

      <div className="mtf-board" role="grid" aria-label="Mouse Trap board">
        {Array.from({ length: 7 }, (_, r) =>
          Array.from({ length: 7 }, (_, c) => {
            // Find which board-square (if any) occupies this grid cell.
            const sqIndex = (() => {
              for (let i = 0; i < BOARD_LEN; i++) {
                const g = squareToGrid(i);
                if (g.row === r && g.col === c) return i;
              }
              return -1;
            })();
            if (sqIndex < 0) {
              // Centre cells — show the trap art.
              const centre = r === 3 && c === 3;
              return (
                <div
                  key={`${r}-${c}`}
                  className={`mtf-cell mtf-cell-empty ${centre ? "mtf-trap" : ""}`}
                >
                  {centre && (
                    <div className={`mtf-trap-art ${state.armed ? "armed" : ""}`}>
                      {state.trapFired ? "SNAP!" : state.armed ? "ARMED" : "Trap"}
                    </div>
                  )}
                </div>
              );
            }
            const sq = BOARD[sqIndex]!;
            const onCheese = sqIndex === CHEESE_WHEEL_SQUARE;
            const inCage = CAGE_SET.has(sqIndex);
            const playersHere: number[] = [];
            for (let p = 0; p < NUM_PLAYERS; p++) {
              if (!state.caught[p] && state.positions[p] === sqIndex) playersHere.push(p);
            }
            let kindClass = `mtf-cell-${sq.kind}`;
            if (onCheese && state.armed) kindClass += " mtf-cheese-armed";
            if (inCage) kindClass += " mtf-cage";
            return (
              <div
                key={`${r}-${c}`}
                className={`mtf-cell ${kindClass}`}
                title={`Square ${sqIndex}: ${sq.label}`}
              >
                <span className="mtf-sq-num">{sqIndex}</span>
                <span className="mtf-sq-label">{sq.label}</span>
                <div className="mtf-tokens">
                  {playersHere.map((pi) => (
                    <span
                      key={pi}
                      className="mtf-token"
                      style={{ background: PLAYER_COLORS[pi] }}
                      title={PLAYER_LABELS[pi]}
                    >
                      {PLAYER_LABELS[pi]![0]}
                    </span>
                  ))}
                </div>
              </div>
            );
          }),
        )}
      </div>

      <div className="mtf-side">
        <div className="mtf-panel">
          <div className="mtf-panel-title">Trap Parts</div>
          <ul className="mtf-parts">
            {PART_NAMES.map((n, i) => (
              <li
                key={n}
                className={`mtf-part ${state.partsBuilt[i] ? "built" : "missing"}`}
                title={state.partsBuilt[i] ? `${n}: built` : `${n}: not built (land on square ${i + 1})`}
              >
                <span className="mtf-part-num">{i + 1}</span> {n} {state.partsBuilt[i] ? "✓" : "·"}
              </li>
            ))}
          </ul>
        </div>

        <div className="mtf-panel">
          <div className="mtf-panel-title">Mice</div>
          <ul className="mtf-mice">
            {PLAYER_LABELS.map((lbl, i) => (
              <li
                key={lbl}
                className={`mtf-mouse ${state.caught[i] ? "caught" : "alive"} ${state.current === i && state.winner === null ? "active" : ""}`}
                style={{ color: PLAYER_COLORS[i] }}
                title={`${lbl}: ${state.caught[i] ? "Caught!" : `Square ${state.positions[i]}`}`}
              >
                <span className="mtf-dot" style={{ background: PLAYER_COLORS[i] }} aria-hidden />
                {lbl}: {state.caught[i] ? "Caught" : `Sq ${state.positions[i]}`}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {state.log.length > 0 && (
        <div className="mtf-log">
          <div className="mtf-log-title">Log</div>
          <ul>
            {state.log.slice(0, 6).map((e, i) => (
              <li key={i}>
                T{e.turn} P{e.player}: {e.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {state.winner !== null && (
        <div className={`mtf-end bounce-in ${state.winner === 0 ? "win" : "loss"}`} role="status">
          <strong>
            {state.winner === 0 ? "You win!" : `${PLAYER_LABELS[state.winner]} wins!`}
          </strong>
          <div>Final score: {terminal?.score ?? 0}</div>
        </div>
      )}
    </div>
  );
}

// Export a way to call reducer for tests / debugging — not used by plugin.
export const _reducer = reducer;
