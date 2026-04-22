import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TapaState, TapaSettings, TapaAction, CellMark } from "./state.js";
import { isTerminal, computeNeighborGroups } from "./state.js";
import "./Tapa.css";

const CELL = 44;

export function Tapa({ state, dispatch, onGameOver }: GameProps<TapaState, TapaSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { puzzle, board, won } = state;
  const { size, clues } = puzzle;
  const clueMap = new Map(clues.map(cl => [cl.r * size + cl.c, cl]));

  return (
    <div className="tapa">
      <div className="tapa-title">Tapa</div>
      <div className={`tapa-status${won ? " win" : ""}`}>
        {won ? `Solved! Score: ${terminal?.score ?? 0}` : `Moves: ${state.moves} — shade cells to match clue groups`}
      </div>

      <div className="tapa-grid" style={{ gridTemplateColumns: `repeat(${size}, ${CELL}px)` }}>
        {Array.from({ length: size * size }, (_, idx) => {
          const r = Math.floor(idx / size), c = idx % size;
          const clue = clueMap.get(idx);

          if (clue) {
            // Compute current neighbor groups for visual feedback
            const current = computeNeighborGroups(board, size, r, c);
            const target = [...clue.groups].sort((a,b) => b-a);
            const ok = JSON.stringify(current) === JSON.stringify(target);
            return (
              <div key={idx} className="tapa-cell clue" style={{ width: CELL, height: CELL }}>
                <span className={`tapa-clue-label${ok ? " ok" : ""}`}>
                  {clue.groups.join(",")}
                </span>
              </div>
            );
          }

          const mark = board[idx] as CellMark;
          return (
            <div
              key={idx}
              className={`tapa-cell ${mark}`}
              style={{ width: CELL, height: CELL }}
              onClick={() => !won && dispatch({ type: "clickCell", idx } satisfies TapaAction)}
            >
              {mark === "dot" ? "·" : ""}
            </div>
          );
        })}
      </div>

      <div className="tapa-btns">
        <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
      </div>
      <div className="tapa-legend">Click: empty → shaded → dot → empty</div>
    </div>
  );
}
