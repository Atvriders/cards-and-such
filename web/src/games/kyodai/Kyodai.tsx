import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KyodaiState, KyodaiSettings } from "./state.js";
import { isTerminal, ROWS, COLS } from "./state.js";
import "./Kyodai.css";

const TILE_COLORS = [
  "#c0392b","#e67e22","#f1c40f","#27ae60","#2980b9","#8e44ad","#16a085",
  "#d35400","#2c3e50","#7f8c8d","#1abc9c","#e74c3c","#3498db","#9b59b6",
  "#e91e63","#ff5722","#4caf50","#00bcd4","#ff9800","#795548",
  "#607d8b","#f06292","#81c784","#64b5f6","#ce93d8","#ffb74d",
  "#a5d6a7","#80cbc4","#ffcc02","#ef9a9a","#80deea","#bcaaa4",
  "#b0bec5","#fff9c4","#dce775","#90caf9",
];

const TILE_SYMBOLS = [
  "🀇","🀈","🀉","🀊","🀋","🀌","🀍","🀎","🀏",
  "🀙","🀚","🀛","🀜","🀝","🀞","🀟","🀠","🀡",
  "🀀","🀁","🀂","🀃","🀄","🀅","🀆",
  "🀇","🀈","🀉","🀊","🀋","🀌","🀍","🀎","🀏","🀙","🀚",
];

export function Kyodai({ state, dispatch }: GameProps<KyodaiState, KyodaiSettings>): JSX.Element {
  const terminal = isTerminal(state);

  return (
    <div className="kyodai-game">
      <div className="kyodai-header">
        <span>Score: {state.score}</span>
        <span>Pairs: {state.moves}</span>
      </div>

      <div
        className="kyodai-board"
        style={{ gridTemplateColumns: `repeat(${COLS}, 42px)` }}
      >
        {Array.from({ length: ROWS }, (_, r) =>
          Array.from({ length: COLS }, (_, c) => {
            const tile = state.grid[r]![c];
            const isSelected = state.selected?.[0] === r && state.selected?.[1] === c;
            const isEmpty = tile === null;
            return (
              <div
                key={`${r},${c}`}
                className={`kyodai-cell${isEmpty ? " kyodai-cell--empty" : ""}${isSelected ? " kyodai-cell--selected" : ""}`}
                style={!isEmpty ? { background: TILE_COLORS[tile! % TILE_COLORS.length] } : undefined}
                onClick={() => !isEmpty && dispatch({ type: "select", row: r, col: c })}
              >
                {!isEmpty && (TILE_SYMBOLS[tile! % TILE_SYMBOLS.length] ?? "?")}
              </div>
            );
          })
        )}
      </div>

      {terminal && (
        <div className="kyodai-overlay">
          <h2>{state.won ? "Board Cleared!" : "No More Moves"}</h2>
          <p>Score: {terminal.score}</p>
        </div>
      )}
    </div>
  );
}
