import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KakurasuState, KakurasuSettings } from "./state.js";
import type { KakurasuAction } from "./state.js";
import { isTerminal, computeRowSum, computeColSum } from "./state.js";
import "./Kakurasu.css";

export function Kakurasu({ state, dispatch, onGameOver }: GameProps<KakurasuState, KakurasuSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { puzzle, shaded, won } = state;
  const { size, rowClues, colClues } = puzzle;

  return (
    <div className="kakurasu">
      <div className="kakurasu-title">Kakurasu</div>
      <div className={`kakurasu-status${won ? " win" : ""}`}>
        {won ? `Solved! Score: ${terminal?.score ?? 0}` : `Moves: ${state.moves}`}
      </div>

      <div className="kakurasu-board">
        {/* Header: column index values + clues */}
        <div className="kakurasu-header">
          <div className="kakurasu-corner" />
          {Array.from({ length: size }, (_, c) => {
            const cur = computeColSum(size, shaded, c);
            const match = cur === colClues[c];
            return (
              <div key={c} className="kakurasu-col-label">
                <span className="val">{c + 1}</span>
                <span className="clue">{colClues[c]}</span>
                {cur > 0 && <span className="cur" style={{ color: match ? "#43a047" : "#e53935" }}>{cur}</span>}
              </div>
            );
          })}
        </div>

        {/* Rows */}
        {Array.from({ length: size }, (_, r) => {
          const cur = computeRowSum(size, shaded, r);
          const match = cur === rowClues[r];
          return (
            <div key={r} className="kakurasu-row">
              <div className="kakurasu-row-label">
                <span className="val">{r + 1}</span>
                <span className="clue">{rowClues[r]}</span>
                {cur > 0 && <span className="cur" style={{ color: match ? "#43a047" : "#e53935" }}>{cur}</span>}
              </div>
              {Array.from({ length: size }, (_, c) => {
                const idx = r * size + c;
                const isShaded = shaded[idx]!;
                return (
                  <div
                    key={c}
                    className={`kakurasu-cell${isShaded ? " shaded" : ""}`}
                    onClick={() => !won && dispatch({ type: "toggle", idx } satisfies KakurasuAction)}
                  >
                    {isShaded ? c + 1 : ""}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="kakurasu-hint">
        Top labels: column value / target sum. Side labels: row value / target sum. Click cells to shade.
      </div>

      <div className="kakurasu-btns">
        <button data-testid="hint-target-kakurasu-action" onClick={() => dispatch({ type: "reset" })}>Reset</button>
      </div>
    </div>
  );
}
