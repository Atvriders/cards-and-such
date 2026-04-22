import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FillominoState, FillominoSettings, FillominoAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Fillomino.css";

const CELL = 44;

// Map region value to hue for coloring
function valueHue(v: number): string {
  const hues: Record<number, string> = {
    1:"#e3f2fd", 2:"#c8e6c9", 3:"#fff9c4", 4:"#ffe0b2",
    5:"#f3e5f5", 6:"#fce4ec", 7:"#e0f2f1", 8:"#fbe9e7",
  };
  return hues[v] ?? "#f9f9f9";
}

export function Fillomino({ state, dispatch, onGameOver }: GameProps<FillominoState, FillominoSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { puzzle, current, selected, won } = state;
  const { size } = puzzle;
  const maxVal = puzzle.size;

  return (
    <div className="fillomino">
      <div className="fillomino-title">Fillomino</div>
      <div className={`fillomino-status${won ? " win" : ""}`}>
        {won ? `Solved! Score: ${terminal?.score ?? 0}` : `Moves: ${state.moves} — fill each region with its size`}
      </div>

      <div className="fillomino-grid" style={{ gridTemplateColumns: `repeat(${size}, ${CELL}px)` }}>
        {Array.from({ length: size * size }, (_, idx) => {
          const isGiven = puzzle.given[idx] !== 0;
          const val = current[idx]!;
          const isSel = selected === idx;
          const bg = val > 0 ? valueHue(val) : "#f9f9f9";

          return (
            <div
              key={idx}
              className={["fillomino-cell", isGiven ? "given" : "", isSel ? "selected" : ""].join(" ")}
              style={{ width: CELL, height: CELL, background: bg }}
              onClick={() => !won && dispatch({ type: "select", idx } satisfies FillominoAction)}
            >
              {val > 0 ? val : ""}
            </div>
          );
        })}
      </div>

      {/* Number pad */}
      <div className="fillomino-pad">
        {Array.from({ length: maxVal }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            className="fillomino-padBtn"
            onClick={() => dispatch({ type: "enter", value: n } satisfies FillominoAction)}
          >
            {n}
          </button>
        ))}
        <button className="fillomino-padBtn clear" onClick={() => dispatch({ type: "enter", value: 0 })}>⌫</button>
      </div>

      <div className="fillomino-btns">
        <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
      </div>
    </div>
  );
}
