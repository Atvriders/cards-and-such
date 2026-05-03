import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CaveState, CaveSettings, CaveAction, CellMark } from "./state.js";
import { isTerminal, computeVisibility } from "./state.js";
import "./Cave.css";

const CELL = 44;

export function Cave({ state, dispatch, onGameOver }: GameProps<CaveState, CaveSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { puzzle, board, won } = state;
  const { size, clues } = puzzle;
  const clueMap = new Map(clues.map(cl => [cl.r * size + cl.c, cl]));

  return (
    <div className="cave">
      <div className="cave-title">Cave (Corral)</div>
      <div className={`cave-status${won ? " win" : ""}`}>
        {won ? `Solved! Score: ${terminal?.score ?? 0}` : `Moves: ${state.moves} — shade cells; unshaded must match clue counts`}
      </div>

      <div className="cave-grid" style={{ gridTemplateColumns: `repeat(${size}, ${CELL}px)` }}>
        {Array.from({ length: size * size }, (_, idx) => {
          const r = Math.floor(idx / size), c = idx % size;
          const clue = clueMap.get(idx);
          const mark = board[idx] as CellMark;
          const vis = clue ? computeVisibility(puzzle, board, r, c) : 0;
          const clueOk = clue ? vis === clue.value : false;

          return (
            <div
              key={idx}
              className={["cave-cell", mark].join(" ")}
              style={{ width: CELL, height: CELL }}
              onClick={() => !won && dispatch({ type: "clickCell", idx } satisfies CaveAction)}
            >
              {clue ? (
                <span className={`cave-clue${clueOk ? " ok" : ""}`}>{clue.value}</span>
              ) : mark === "dot" ? "·" : ""}
            </div>
          );
        })}
      </div>

      <div className="cave-btns">
        <button data-testid="hint-target-cave-action" onClick={() => dispatch({ type: "reset" })}>Reset</button>
      </div>
      <div className="cave-legend">Click: empty → shaded → dot → empty</div>
    </div>
  );
}
