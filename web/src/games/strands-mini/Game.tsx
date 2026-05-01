import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const LABELS = ["A", "B", "C", "D"];

export function StrandsMiniGame({ state, dispatch, onGameOver }: GameProps<GameState, GameSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="str-wrap">
        <div className="str-done">
          <h2>Done!</h2>
          <p>Correct: {state.correctCount} / {state.rounds.length}</p>
          <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#27ae60" }}>{state.score} pts</p>
        </div>
      </div>
    );
  }

  const r = state.rounds[state.currentIndex]!;
  const isResult = state.phase === "result";

  return (
    <div className="str-wrap">
      <div className="str-header">
        <span className="str-progress">Round {state.currentIndex + 1} / {state.rounds.length}</span>
        <span className="str-score">{state.score} pts</span>
      </div>
      <div className="str-prompt">{r.prompt}</div>
      <div className="str-choices">
        {r.choices.map((choice, i) => {
          let cls = "str-choice";
          if (isResult) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type: "select", choice: i } as GameAction)}>
              <span className="str-letter">{LABELS[i]}</span>{choice}
            </button>
          );
        })}
      </div>
      {isResult && (
        <div className={`str-feedback ${state.selected === r.correct ? "correct" : "wrong"}`}>
          {state.selected === r.correct ? "Correct!" : `Answer: ${r.choices[r.correct]}`}
        </div>
      )}
      <div className="str-actions">
        {!isResult && (
          <button className="str-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as GameAction)}>Submit</button>
        )}
        {isResult && (
          <button className="str-btn next" onClick={() => dispatch({ type: "next" } as GameAction)}>
            {state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
