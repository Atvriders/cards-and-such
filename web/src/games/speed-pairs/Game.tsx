import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpeedPairsState, SpeedPairsAction, SpeedPairsSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SpeedPairsGame({ state, dispatch, onGameOver }: GameProps<SpeedPairsState, SpeedPairsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="gspeedp-wrap"><div className="gspeedp-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="gspeedp-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="gspeedp-wrap">
      <div className="gspeedp-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="gspeedp-score">{state.score} pts</div>
      <div className="gspeedp-prompt">{r.question}</div>
      <div className="gspeedp-grid">
        {r.choices.map((n, i) => {
          let cls = "gspeedp-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as SpeedPairsAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="gspeedp-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as SpeedPairsAction)}>Submit</button>}
      {state.submitted && <button className="gspeedp-btn next" onClick={() => dispatch({ type: "next" } as SpeedPairsAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
