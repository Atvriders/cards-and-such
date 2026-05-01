import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FutoshikiState, FutoshikiSettings } from "./state.js";
import { type FutoshikiAction, isTerminal } from "./state.js";
import "./Game.css";

export function Futoshiki({
  state,
  dispatch,
  onGameOver,
}: GameProps<FutoshikiState, FutoshikiSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { puzzle, board, selected, won } = state;
  const { size, inequalities } = puzzle;

  // Build inequality display: map "r,c,h" -> sign or "r,c,v" -> sign
  const ineqMap = new Map<string, "<" | ">">();
  for (const ineq of inequalities) {
    ineqMap.set(`${ineq.r},${ineq.c},${ineq.direction}`, ineq.sign);
  }

  function getIneqH(r: number, c: number): string {
    const sign = ineqMap.get(`${r},${c},h`);
    if (!sign) return "";
    return sign === "<" ? "<" : ">";
  }

  function getIneqV(r: number, c: number): string {
    const sign = ineqMap.get(`${r},${c},v`);
    if (!sign) return "";
    return sign === "<" ? "∧" : "∨"; // up-arrow means top < bottom
  }

  function handleCellClick(idx: number) {
    if (won) return;
    dispatch({ type: "selectCell", idx } satisfies FutoshikiAction);
  }

  function handleNumber(num: number) {
    dispatch({ type: "placeNumber", num } satisfies FutoshikiAction);
  }

  return (
    <div className="futoshikiviolet">
      <div className="futoshikiviolet-title">Futoshiki</div>
      <div className={`futoshikiviolet-status${won ? " win" : ""}`}>
        {won
          ? `Solved! Score: ${terminal?.score ?? 0}`
          : `Moves: ${state.moves} — fill 1–${size} in each row and column`}
      </div>

      <div className="futoshikiviolet-grid-wrap">
        {Array.from({ length: size }, (_, r) => (
          <div key={r} className="futoshikiviolet-grid-row">
            {Array.from({ length: size }, (_, c) => {
              const idx = r * size + c;
              const val = board[idx] ?? 0;
              const isGiven = puzzle.givens[idx] !== 0;
              const isSel = selected === idx;
              const ineqRight = c < size - 1 ? getIneqH(r, c) : "";
              return (
                <div key={c} className="futoshikiviolet-cell-group">
                  <div
                    className={[
                      "futoshikiviolet-cell",
                      isGiven ? "given" : "",
                      isSel ? "selected" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => handleCellClick(idx)}
                    data-testid={`cell-${idx}`}
                  >
                    {val > 0 ? val : ""}
                  </div>
                  {c < size - 1 && (
                    <div className="futoshikiviolet-ineq-h">{ineqRight}</div>
                  )}
                </div>
              );
            })}
            {/* Vertical inequalities row below */}
            {r < size - 1 && (
              <div className="futoshikiviolet-ineq-row" style={{ display: "none" }} />
            )}
          </div>
        ))}
        {/* Vertical inequality rows */}
        {Array.from({ length: size - 1 }, (_, r) => (
          <div key={`vrow-${r}`} className="futoshikiviolet-grid-row futoshikiviolet-ineq-v-row">
            {Array.from({ length: size }, (_, c) => (
              <div key={c} className="futoshikiviolet-cell-group">
                <div className="futoshikiviolet-ineq-v">{getIneqV(r, c)}</div>
                {c < size - 1 && <div className="futoshikiviolet-ineq-h-spacer" />}
              </div>
            ))}
          </div>
        ))}
      </div>

      {!won && (
        <div className="futoshikiviolet-numpad">
          {Array.from({ length: size }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className="futoshikiviolet-num-btn"
              onClick={() => handleNumber(n)}
              data-testid={`num-${n}`}
            >
              {n}
            </button>
          ))}
          <button
            className="futoshikiviolet-num-btn clear"
            onClick={() => dispatch({ type: "clearCell" } satisfies FutoshikiAction)}
          >
            ✕
          </button>
        </div>
      )}
      <div className="futoshikiviolet-hint">
        Select a cell then tap a number. &lt; and &gt; show which neighbor must be smaller/larger. ∧ = left cell &lt; right cell direction for vertical.
      </div>
    </div>
  );
}
