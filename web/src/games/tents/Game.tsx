import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TentsState, TentsSettings } from "./state.js";
import { type TentsAction, isTerminal, countTentsInRow, countTentsInCol } from "./state.js";
import "./Game.css";

const CELL_SIZE = 40;

export function Tents({
  state,
  dispatch,
  onGameOver,
}: GameProps<TentsState, TentsSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { puzzle, board, won } = state;
  const { size, trees, rowClues, colClues } = puzzle;

  return (
    <div className="tentsforest">
      <div className="tentsforest-title">Tents</div>
      <div className={`tentsforest-status${won ? " win" : ""}`}>
        {won
          ? `Solved! Score: ${terminal?.score ?? 0}`
          : `Moves: ${state.moves} — place tentsforest beside trees; no two tentsforest touch`}
      </div>

      <div className="tentsforest-wrap">
        {/* Row clues on left */}
        <div className="tentsforest-left">
          {/* Spacer for col clues row */}
          <div style={{ height: CELL_SIZE }} />
          {rowClues.map((clue, r) => {
            const count = countTentsInRow(board, size, r);
            const cls = count === clue ? "tentsforest-clue-ok" : count > clue ? "tentsforest-clue-over" : "";
            return (
              <div
                key={r}
                className={`tentsforest-row-clue ${cls}`}
                style={{ width: 28, height: CELL_SIZE }}
              >
                {clue}
              </div>
            );
          })}
        </div>

        <div className="tentsforest-main">
          {/* Col clues on top */}
          <div className="tentsforest-col-clues">
            {colClues.map((clue, c) => {
              const count = countTentsInCol(board, size, c);
              const cls = count === clue ? "tentsforest-clue-ok" : count > clue ? "tentsforest-clue-over" : "";
              return (
                <div
                  key={c}
                  className={`tentsforest-col-clue ${cls}`}
                  style={{ width: CELL_SIZE, height: CELL_SIZE }}
                >
                  {clue}
                </div>
              );
            })}
          </div>

          {/* Grid */}
          {Array.from({ length: size }, (_, r) => (
            <div key={r} className="tentsforest-grid-row">
              {Array.from({ length: size }, (_, c) => {
                const idx = r * size + c;
                const isTree = trees[idx];
                const mark = board[idx]!;
                return (
                  <div
                    key={c}
                    className={[
                      "tentsforest-cell",
                      isTree ? "tree" : mark,
                    ].join(" ")}
                    style={{ width: CELL_SIZE, height: CELL_SIZE }}
                    onClick={() => {
                      if (won) return;
                      dispatch({ type: "clickCell", idx } satisfies TentsAction);
                    }}
                  >
                    {isTree ? "🌲" : mark === "tent" ? "⛺" : mark === "x" ? "×" : ""}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="tentsforest-btn-row">
        <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
      </div>
    </div>
  );
}
