import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MagicianTrickState, MagicianTrickSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./MagicianTrick.css";

export function MagicianTrick({ state, dispatch, onGameOver }: GameProps<MagicianTrickState, MagicianTrickSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="magician-trick">
      <div className="mt-stats">
        <span>Round: {Math.min(state.round, state.totalRounds)}/{state.totalRounds}</span>
        <span>Wins: {state.wins}</span>
        <span>Score: {state.score}</span>
      </div>

      <div className="mt-cups">
        {Array.from({ length: state.numCups }, (_, i) => {
          const hasBall = state.displayPos === i;
          const isGuessed = state.guessed === i;
          const isCorrect = state.phase === "result" && i === state.ballPos;
          const isWrong = state.phase === "result" && isGuessed && !isCorrect;
          return (
            <div
              key={i}
              className={`mt-cup${isGuessed ? " selected" : ""}${isCorrect ? " correct" : ""}${isWrong ? " wrong" : ""}`}
              onClick={() => state.phase === "guess" && dispatch({ type: "guess", cup: i })}
            >
              <span className="mt-cup-emoji">🎩</span>
              {hasBall && <span className="mt-ball">⚽</span>}
              <span className="mt-label">Cup {i + 1}</span>
            </div>
          );
        })}
      </div>

      <div className={`mt-message${state.correct ? " mt-win" : state.phase === "result" && !state.correct ? " mt-lose" : ""}`}>
        {state.message}
      </div>

      {state.phase === "reveal" && (
        <button className="mt-btn" onClick={() => dispatch({ type: "startShuffle" })}>
          🎩 Start Shuffle
        </button>
      )}
      {state.phase === "shuffle" && (
        <button className="mt-btn" onClick={() => dispatch({ type: "nextShuffle" })}>
          ➡️ Next Swap
        </button>
      )}
      {state.phase === "result" && !state.gameOver && (
        <button className="mt-btn" onClick={() => dispatch({ type: "nextRound" })}>
          ▶ Next Round
        </button>
      )}
      {state.gameOver && (
        <button className="mt-btn" onClick={() => dispatch({ type: "restart" })}>🔄 Play Again</button>
      )}
      {!state.gameOver && (
        <button className="mt-btn" onClick={() => dispatch({ type: "restart" })}>New Game</button>
      )}
    </div>
  );
}
