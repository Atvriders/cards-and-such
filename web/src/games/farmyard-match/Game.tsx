import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FarmState, FarmSettings, Home } from "./state.js";
import type { FarmAction } from "./state.js";
import { isTerminal, ANIMAL_HOME } from "./state.js";
import "./Game.css";

const ANIMAL_EMOJI: Record<string, string> = {
  cow: "🐄", pig: "🐷", sheep: "🐑", chicken: "🐔", horse: "🐴", duck: "🦆",
};
const HOME_LABELS: Record<string, string> = {
  barn: "Barn", sty: "Pig Sty", pen: "Sheep Pen", coop: "Hen Coop", stable: "Stable", pond: "Pond",
};

export function FarmyardMatch({ state, dispatch, onGameOver }: GameProps<FarmState, FarmSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const allGuessed = state.userGuesses.every(g => g !== null);

  return (
    <div className="fm-game">
      <div className={`fm-status${state.submitted && state.correctCount === state.animals.length ? " win" : ""}`}>
        {state.message}
      </div>

      <div className="fm-pairs">
        {state.animals.map((animal, i) => {
          const guess = state.userGuesses[i];
          const isCorrect = state.submitted && guess === ANIMAL_HOME[animal];
          const isWrong = state.submitted && guess !== ANIMAL_HOME[animal];
          return (
            <div key={animal} className={`fm-pair${isCorrect ? " correct" : isWrong ? " wrong" : ""}`}>
              <div className="fm-animal">{ANIMAL_EMOJI[animal] ?? "🐾"} {animal}</div>
              <span className="fm-arrow">→</span>
              <select
                className="fm-select"
                value={guess ?? ""}
                disabled={state.submitted}
                onChange={(e) => dispatch({ type: "guess", animalIndex: i, home: e.target.value as Home } satisfies FarmAction)}
              >
                <option value="">-- Pick home --</option>
                {state.homes.map(home => (
                  <option key={home} value={home}>{HOME_LABELS[home] ?? home}</option>
                ))}
              </select>
              {state.submitted && <span>{isCorrect ? "✅" : `❌ (${HOME_LABELS[ANIMAL_HOME[animal]!] ?? ANIMAL_HOME[animal]})`}</span>}
            </div>
          );
        })}
      </div>

      {!state.submitted && (
        <button
          className="fm-submit-btn"
          disabled={!allGuessed}
          onClick={() => dispatch({ type: "submit" } satisfies FarmAction)}
        >
          Submit
        </button>
      )}
    </div>
  );
}
