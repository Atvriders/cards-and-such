import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ConcentrationSpeedState, ConcentrationSpeedAction, ConcentrationSpeedSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function ConcentrationSpeedGame({ state, dispatch, onGameOver }: GameProps<ConcentrationSpeedState, ConcentrationSpeedSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="concentrationspeed-wrap"><div className="concentrationspeed-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="concentrationspeed-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="concentrationspeed-wrap">
      <div className="concentrationspeed-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="concentrationspeed-score">{state.score} pts</div>
      <div className="concentrationspeed-prompt">{r.question}</div>
      <div className="concentrationspeed-grid">
        {r.choices.map((n, i) => {
          let cls = "concentrationspeed-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as ConcentrationSpeedAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="concentrationspeed-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as ConcentrationSpeedAction)}>Submit</button>}
      {state.submitted && <button className="concentrationspeed-btn next" onClick={() => dispatch({ type: "next" } as ConcentrationSpeedAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
