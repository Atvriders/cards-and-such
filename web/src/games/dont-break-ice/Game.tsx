import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DontBreakState, DontBreakSettings } from "./state.js";
import type { DontBreakAction } from "./state.js";
import { isTerminal, isSupportCube, GRID_ROWS, GRID_COLS } from "./state.js";
import "./Game.css";

export function DontBreakIce({ state, dispatch, onGameOver }: GameProps<DontBreakState, DontBreakSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const canPlay = state.turn === 0 && state.loser === null;

  return (
    <div className="dbi-game">
      <div className={`dbi-status ${state.loser === 1 ? "win" : state.loser === 0 ? "loss" : ""}`}>
        {state.message}
      </div>

      <div className="dbi-info">
        <span>Cubes left: <strong>{state.cubesRemaining}</strong></span>
        <span>Support left: <strong>{state.supportRemaining}</strong></span>
        {state.loser === null && <span>{state.turn === 0 ? "Your turn" : "Bot thinking…"}</span>}
      </div>

      <div className="dbi-grid">
        {Array.from({ length: GRID_ROWS }, (_, r) =>
          Array.from({ length: GRID_COLS }, (_, c) => {
            const present = state.grid[r]![c]!;
            const support = isSupportCube(r, c);
            const isLast = state.lastRemoved?.[0] === r && state.lastRemoved?.[1] === c;
            let cls = "dbi-cube";
            if (!present) cls += " removed";
            if (support && present) cls += " support";
            if (isLast) cls += " last-removed";

            return (
              <div
                key={`${r}-${c}`}
                className={cls}
                onClick={() => canPlay && present && dispatch({ type: "remove", row: r, col: c } satisfies DontBreakAction)}
                title={support ? "Support cube!" : `[${r + 1},${c + 1}]`}
              >
                {present ? (support ? "🐧" : "🧊") : ""}
              </div>
            );
          })
        )}
      </div>

      {state.loser === null && (
        <p className="dbi-hint">Click any 🧊 cube. Avoid knocking out all 4 🐧 center supports!</p>
      )}
    </div>
  );
}
