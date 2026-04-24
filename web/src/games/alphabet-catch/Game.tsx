import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AlphabetState, AlphabetSettings } from "./state.js";
import type { AlphabetAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function AlphabetCatch({ state, dispatch, onGameOver }: GameProps<AlphabetState, AlphabetSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const statusCls = `ac-status${state.lastCorrect === true ? " correct" : state.lastCorrect === false ? " wrong" : ""}`;

  return (
    <div className="ac-game">
      <div className={statusCls}>{state.message}</div>
      <div className="ac-progress">Round {state.roundNum}/{state.totalRounds} | Score: {state.score}</div>

      {!state.done && (
        <>
          <div className="ac-letter">{state.target}</div>
          <div className="ac-choices">
            {state.choices.map(letter => (
              <button
                key={letter}
                className="ac-btn"
                onClick={() => dispatch({ type: "catch", letter } satisfies AlphabetAction)}
              >
                {letter}
              </button>
            ))}
          </div>
        </>
      )}

      {state.done && <div className="ac-score">Final Score: {state.score}</div>}
    </div>
  );
}
