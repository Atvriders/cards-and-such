import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HatState, HatSettings } from "./state.js";
import { type HatAction, isTerminal } from "./state.js";
import "./Game.css";

export function PrisonerHatGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<HatState, HatSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { puzzle, selectedOption, submitted, correct } = state;

  return (
    <div className="prisoner-hat">
      <div className="ph-title">{puzzle.title}</div>
      <div className="ph-scenario">{puzzle.scenario}</div>

      {puzzle.prisoners.length > 0 && (
        <div className="ph-prisoners">
          {puzzle.prisoners.map((p) => (
            <div className="ph-prisoner" key={p.name}>
              <div className={`ph-hat ph-hat-${p.hatColor}`} />
              <div className="ph-prisoner-name">{p.name}</div>
              <div className="ph-prisoner-sees">
                Sees: {p.canSee.length ? p.canSee.join(", ") : "nobody"}
              </div>
              <div className="ph-prisoner-says">&ldquo;{p.says}&rdquo;</div>
            </div>
          ))}
        </div>
      )}

      {!submitted ? (
        <div className="ph-options">
          {puzzle.options.map((opt, i) => (
            <button
              key={i}
              className={`ph-option-btn ${selectedOption === i ? "selected" : ""}`}
              onClick={() => dispatch({ type: "selectOption", option: i } satisfies HatAction)}
            >
              {opt}
            </button>
          ))}
          <button
            className="ph-submit-btn"
            disabled={selectedOption === null}
            onClick={() => dispatch({ type: "submit" } satisfies HatAction)}
          >
            Submit Answer
          </button>
        </div>
      ) : (
        <div className={`ph-result ${correct ? "ph-correct" : "ph-wrong"}`}>
          <div className="ph-result-verdict">{correct ? "Correct!" : "Wrong!"}</div>
          <div className="ph-explanation">{puzzle.explanation}</div>
          <button
            className="ph-next-btn"
            onClick={() => dispatch({ type: "next" } satisfies HatAction)}
          >
            Next Puzzle
          </button>
        </div>
      )}
      <div className="ph-score">Total Score: {state.totalScore}</div>
    </div>
  );
}
