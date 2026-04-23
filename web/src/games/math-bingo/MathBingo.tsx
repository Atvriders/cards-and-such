import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MathBingoState, MathBingoSettings } from "./state.js";
import { isTerminal, FREE_CENTER } from "./state.js";
import "./MathBingo.css";

export function MathBingo({
  state,
  dispatch,
  onGameOver,
}: GameProps<MathBingoState, MathBingoSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="mb-game">
      <div className="mb-title">Math Bingo</div>

      <div className="mb-problem-area">
        {state.problem ? (
          <>
            <div className="mb-problem">{state.problem.text} = ?</div>
            <div className={`mb-feedback ${state.lastCorrect ? "match" : "no-match"}`}>
              {state.lastCorrect ? `✓ ${state.problem.answer} is on your card!` : `✗ ${state.problem.answer} — not marked`}
            </div>
          </>
        ) : (
          <div className="mb-problem-placeholder">Click Draw to start</div>
        )}
      </div>

      <div className="mb-card">
        {["B", "I", "N", "G", "O"].map((letter, ci) => (
          <div key={letter} className="mb-col-label">{letter}</div>
        ))}
        {state.card.map((num, i) => (
          <div
            key={i}
            className={`mb-cell ${state.marked[i] ? "marked" : ""} ${i === FREE_CENTER ? "free" : ""}`}
          >
            {i === FREE_CENTER ? "FREE" : num}
          </div>
        ))}
      </div>

      <div className="mb-info">Problems drawn: {state.problemsDrawn} / 30</div>

      {!state.done && (
        <button className="mb-draw-btn" onClick={() => dispatch({ type: "draw" })}>
          Draw Problem
        </button>
      )}

      {state.done && (
        <div className="mb-game-over">
          {state.won ? "BINGO!" : "No bingo this time."}<br />
          <span className="mb-score">Score: {terminal?.score}</span>
        </div>
      )}
    </div>
  );
}
