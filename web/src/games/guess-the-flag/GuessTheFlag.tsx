import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GuessFlagState, GuessFlagSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./GuessTheFlag.css";

export function GuessTheFlag({
  state,
  dispatch,
  onGameOver,
}: GameProps<GuessFlagState, GuessFlagSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { question, isRevealed, selected } = state;
  const correctName = question.correct.name;

  function choiceClass(country: import("./state.js").Country): string {
    if (!isRevealed) return "gf-choice";
    if (country.name === correctName) return "gf-choice correct";
    if (selected?.name === country.name) return "gf-choice wrong";
    return "gf-choice";
  }

  const isCorrect = selected?.name === correctName;

  return (
    <div className="guess-flag">
      {state.phase === "done" ? (
        <div className="gf-done bounce-in">
          Quiz complete! {state.correct}/{state.totalRounds} correct
          <br />Score: {state.correct * 4}
        </div>
      ) : (
        <>
          <div className="gf-progress">
            Round {state.roundNumber} / {state.totalRounds} · ✓{state.correct} ✗{state.wrong}
          </div>

          <div className="gf-flag">{question.correct.flag}</div>
          <div className="gf-prompt">Which country does this flag belong to?</div>

          <div className="gf-choices">
            {question.choices.map((country) => (
              <button
                key={country.name}
                className={choiceClass(country)}
                onClick={() => dispatch({ type: "select", country })}
                disabled={isRevealed}
              >
                {country.name}
              </button>
            ))}
          </div>

          {isRevealed && (
            <>
              <div className={`gf-feedback${isCorrect ? " correct" : " wrong"}`}>
                {isCorrect ? "Correct! 🎉" : `Wrong — it's ${correctName}`}
              </div>
              <button className="gf-next-btn" onClick={() => dispatch({ type: "next" })}>
                {state.roundNumber >= state.totalRounds ? "Finish" : "Next Flag →"}
              </button>
            </>
          )}

          <div className="gf-stats">
            <span>🔥 Streak: {state.streak}</span>
            <span>Score: {state.correct * 4}</span>
          </div>
        </>
      )}
    </div>
  );
}
