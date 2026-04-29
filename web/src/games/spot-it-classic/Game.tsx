import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpotItClassicState, SpotItClassicAction, SpotItClassicSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SpotItClassicGame({ state, dispatch, onGameOver }: GameProps<SpotItClassicState, SpotItClassicSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="gspotit-wrap"><div className="gspotit-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="gspotit-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="gspotit-wrap">
      <div className="gspotit-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="gspotit-score">{state.score} pts</div>
      <div className="gspotit-prompt">{r.question}</div>
      <div className="gspotit-grid">
        {r.choices.map((n, i) => {
          let cls = "gspotit-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as SpotItClassicAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="gspotit-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as SpotItClassicAction)}>Submit</button>}
      {state.submitted && <button className="gspotit-btn next" onClick={() => dispatch({ type: "next" } as SpotItClassicAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
