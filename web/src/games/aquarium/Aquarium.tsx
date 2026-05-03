import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AquariumState, AquariumSettings, AquariumAction, CellState } from "./state.js";
import { isTerminal, countWaterInRow, countWaterInCol } from "./state.js";
import "./Aquarium.css";

const CELL = 40;
const REGION_COLORS = ["#e3f2fd","#c8e6c9","#fff9c4","#ffe0b2","#f3e5f5","#fce4ec","#e0f2f1","#fbe9e7","#e8eaf6","#f1f8e9"];

export function Aquarium({ state, dispatch, onGameOver }: GameProps<AquariumState, AquariumSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { puzzle, cells, won } = state;
  const { size, rowClues, colClues, region } = puzzle;

  return (
    <div className="aquarium">
      <div className="aquarium-title">Aquarium</div>
      <div className={`aquarium-status${won ? " win" : ""}`}>
        {won ? `Solved! Score: ${terminal?.score ?? 0}` : `Moves: ${state.moves} — fill regions with water from bottom`}
      </div>

      <div className="aquarium-wrap">
        {/* Col clues top */}
        <div className="aquarium-top-row">
          <div style={{ width: CELL, height: CELL }} />
          {colClues.map((clue, c) => {
            const count = countWaterInCol(cells, size, c);
            const ok = count === clue;
            return (
              <div key={c} className={`aquarium-clue${ok ? " ok" : ""}`} style={{ width: CELL, height: CELL }}>
                {clue}
              </div>
            );
          })}
        </div>

        {/* Grid rows with row clues */}
        {Array.from({ length: size }, (_, r) => {
          const rowCount = countWaterInRow(cells, size, r);
          const rowOk = rowCount === rowClues[r];
          return (
            <div key={r} className="aquarium-row">
              <div className={`aquarium-clue${rowOk ? " ok" : ""}`} style={{ width: CELL, height: CELL }}>
                {rowClues[r]}
              </div>
              {Array.from({ length: size }, (_, c) => {
                const idx = r * size + c;
                const ri = region[idx]!;
                const cell = cells[idx] as CellState;
                const bg = cell === "water"
                  ? "#64b5f6"
                  : REGION_COLORS[ri % REGION_COLORS.length]!;
                return (
                  <div
                    key={c}
                    className={`aquarium-cell ${cell}`}
                    style={{ width: CELL, height: CELL, background: bg }}
                    onClick={() => !won && dispatch({ type: "clickCell", idx } satisfies AquariumAction)}
                  >
                    {cell === "x" ? "×" : ""}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="aquarium-btns">
        <button data-testid="hint-target-aquarium-action" onClick={() => dispatch({ type: "reset" })}>Reset</button>
      </div>
      <div className="aquarium-legend">Click: empty → water (blue) → × → empty</div>
    </div>
  );
}
