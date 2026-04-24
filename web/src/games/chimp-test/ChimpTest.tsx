import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ChimpTestState } from "./state.js";
import { isTerminal } from "./state.js";
import type { chimpTestSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./ChimpTest.css";

type ChimpTestSettings = SettingsOf<typeof chimpTestSettings>;

const GRID_SIZE = 5;
const MAX_LIVES = 3;

export function ChimpTest({
  state,
  dispatch,
  onGameOver,
}: GameProps<ChimpTestState, ChimpTestSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  // Build grid: which cell has which number
  const grid: (number | null)[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(null),
  );
  for (const cell of state.cells) {
    grid[cell.y]![cell.x] = cell.number;
  }

  return (
    <div className="chimp-test">
      <div className="ct-info">
        <span>Round: <strong>{state.round}</strong></span>
        <span>Numbers: <strong>{state.count}</strong></span>
        <span>Score: <strong>{state.score}</strong></span>
        <span>
          Lives:{" "}
          <strong>
            {"❤️".repeat(state.lives)}{"🖤".repeat(MAX_LIVES - state.lives)}
          </strong>
        </span>
      </div>

      {state.lastCorrect === false && (
        <div className="ct-feedback wrong">Wrong square! {state.lives > 0 ? "Try again." : ""}</div>
      )}
      {state.lastCorrect === true && (
        <div className="ct-feedback correct">Round complete!</div>
      )}

      {terminal ? (
        <div className="ct-ended">Game over! Score: {state.score}</div>
      ) : (
        <>
          <div className="ct-grid">
            {grid.map((row, y) =>
              row.map((num, x) => {
                const isEmpty = num === null;
                const isClicked = num !== null && state.clickOrder.includes(num);
                return (
                  <div
                    key={`${x}-${y}`}
                    className={`ct-cell${isEmpty ? " ct-empty" : ""}${isClicked ? " ct-clicked" : ""}`}
                    onClick={() => {
                      if (!isEmpty && !isClicked && state.phase === "recall") {
                        dispatch({ type: "click", number: num! });
                      }
                    }}
                  >
                    {state.phase === "show" && num !== null ? num : ""}
                  </div>
                );
              }),
            )}
          </div>

          {state.phase === "show" && (
            <button className="ct-start-btn" onClick={() => dispatch({ type: "start" })}>
              Start (hide numbers)
            </button>
          )}
          {state.phase === "recall" && (
            <div className="ct-instruction">
              Click square <strong>{state.expected}</strong>
            </div>
          )}
        </>
      )}
    </div>
  );
}
