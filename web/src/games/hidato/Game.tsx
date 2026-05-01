import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HidatoState, HidatoSettings } from "./state.js";
import { type HidatoAction, isTerminal } from "./state.js";
import "./Game.css";

export function Hidato({
  state,
  dispatch,
  onGameOver,
}: GameProps<HidatoState, HidatoSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const [inputVal, setInputVal] = useState("");

  const { puzzle, board, selected, won } = state;
  const { rows, cols, solution } = puzzle;
  const N = solution.filter((v) => v > 0).length;

  function handleCellClick(idx: number) {
    if (won) return;
    if (puzzle.given[idx] || solution[idx] === 0) return;
    dispatch({ type: "selectCell", idx } satisfies HidatoAction);
    setInputVal("");
  }

  function handlePlace() {
    const num = parseInt(inputVal, 10);
    if (!isNaN(num)) {
      dispatch({ type: "placeNumber", num } satisfies HidatoAction);
      setInputVal("");
    }
  }

  return (
    <div className="hidatosnake">
      <div className="hidatosnake-title">Hidato</div>
      <div className={`hidatosnake-status${won ? " win" : ""}`}>
        {won
          ? `Solved! Score: ${terminal?.score ?? 0}`
          : `Moves: ${state.moves} — fill 1 to ${N} consecutively adjacent`}
      </div>
      <div
        className="hidatosnake-grid"
        style={{ gridTemplateColumns: `repeat(${cols}, 46px)` }}
      >
        {Array.from({ length: rows * cols }, (_, i) => {
          const val = board[i] ?? 0;
          const isBlocked = solution[i] === 0;
          const isGiven = puzzle.given[i];
          const isSel = selected === i;
          const classes = [
            "hidatosnake-cell",
            isBlocked ? "blocked" : "",
            isGiven ? "given" : "",
            isSel ? "selected" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <div
              key={i}
              className={classes}
              onClick={() => handleCellClick(i)}
              data-testid={`cell-${i}`}
            >
              {!isBlocked && val > 0 ? val : ""}
            </div>
          );
        })}
      </div>
      {!won && selected !== null && (
        <div className="hidatosnake-input">
          <input
            type="number"
            min={1}
            max={N}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePlace()}
            placeholder={`1–${N}`}
            className="hidatosnake-number-input"
            autoFocus
          />
          <button className="hidatosnake-btn" onClick={handlePlace}>
            Place
          </button>
          <button
            className="hidatosnake-btn clear"
            onClick={() => {
              dispatch({ type: "clearCell", idx: selected } satisfies HidatoAction);
              setInputVal("");
            }}
          >
            Clear
          </button>
        </div>
      )}
      <div className="hidatosnake-hint">
        Select a cell, type a number, and press Place. Consecutive numbers must be king-adjacent (including diagonals).
      </div>
    </div>
  );
}
