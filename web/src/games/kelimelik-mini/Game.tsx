import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KelimelikMiniState, KelimelikMiniAction, KelimelikMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const LABELS = ["A", "B", "C", "D"];

export function KelimelikMiniGame({ state, dispatch, onGameOver }: GameProps<KelimelikMiniState, KelimelikMiniSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="klm-wrap">
        <div className="klm-done">
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
    <div className="klm-wrap">
      <div className="klm-header">
        <span className="klm-progress">Round {state.currentIndex + 1} / {state.rounds.length}</span>
        <span className="klm-score">{state.score} pts</span>
      </div>
      <div className="klm-prompt"><span className="klm-label">Choose:</span> {r.prompt}</div>
      <div className="klm-choices">
        {r.choices.map((choice, i) => {
          let cls = "klm-choice";
          if (isResult) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type: "select", choice: i } as KelimelikMiniAction)}>
              <span className="klm-choice-letter">{LABELS[i]}</span>{choice}
            </button>
          );
        })}
      </div>
      {isResult && (
        <div className={`klm-feedback ${state.selected === r.correct ? "correct" : "wrong"}`}>
          {state.selected === r.correct ? "Correct!" : `Answer: ${r.choices[r.correct]}`}
        </div>
      )}
      <div className="klm-actions">
        {!isResult && (
          <button className="klm-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as KelimelikMiniAction)}>Submit</button>
        )}
        {isResult && (
          <button className="klm-btn next" onClick={() => dispatch({ type: "next" } as KelimelikMiniAction)}>
            {state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
