import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SnakesRaceState, SnakesRaceSettings } from "./state.js";
import { isTerminal, FINISH } from "./state.js";
import "./Game.css";

const LABELS = ["You", "Bot"];

export function SnakesRace({ state, dispatch, onGameOver }: GameProps<SnakesRaceState, SnakesRaceSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const canRoll = state.currentPlayer === 0 && state.phase === "rolling" && state.winner === null;
  const canConfirm = state.currentPlayer === 1 && state.phase === "result" && state.winner === null ||
    state.currentPlayer === 0 && state.phase === "result" && state.winner === null;

  const squares = Array.from({ length: FINISH + 1 }, (_, i) => i);

  return (
    <div className="snakes-race">
      <div className="sr-header">
        {state.winner !== null
          ? <span className="sr-winner">{LABELS[state.winner]} wins!</span>
          : <span>{LABELS[state.currentPlayer]}&apos;s turn</span>
        }
      </div>

      {state.dice.length > 0 && (
        <div className="sr-dice">
          Rolled: {state.dice[0]} + {state.dice[1]} = {state.dice[0]! + state.dice[1]!}
        </div>
      )}

      {/* Track visualization */}
      <div className="sr-track">
        {squares.map((sq) => {
          const isSnake = state.snakeSquares.includes(sq);
          const hasHuman = state.positions[0] === sq;
          const hasBot = state.positions[1] === sq;
          const isFinish = sq === FINISH;
          return (
            <div
              key={sq}
              className={`sr-sq ${isSnake ? "snake" : ""} ${isFinish ? "finish" : ""}`}
              title={isSnake ? "Snake!" : undefined}
            >
              <span className="sr-sq-num">{sq}</span>
              {isSnake && <span className="sr-snake-icon">🐍</span>}
              {isFinish && <span className="sr-finish-icon">🏁</span>}
              <div className="sr-tokens">
                {hasHuman && <span className="sr-token human">Y</span>}
                {hasBot && <span className="sr-token bot">B</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="sr-positions">
        <span>You: sq {state.positions[0]}</span>
        <span>Bot: sq {state.positions[1]}</span>
      </div>

      <div className="sr-controls">
        {canRoll && (
          <button data-testid="hint-target-snakes-race-roll" onClick={() => dispatch({ type: "roll" })}>Roll Dice</button>
        )}
        {state.currentPlayer === 0 && state.phase === "result" && state.winner === null && (
          <button data-testid="hint-target-snakes-race-confirm" onClick={() => dispatch({ type: "confirm" })}>Bot&apos;s Turn</button>
        )}
      </div>

      <div className="sr-legend">Snake squares: {state.snakeSquares.join(", ")} — land on one and go back to square 1!</div>
    </div>
  );
}
