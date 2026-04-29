import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ColorBrainState, ColorBrainAction, ColorBrainSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function ColorBrainGame({ state, dispatch, onGameOver }: GameProps<ColorBrainState, ColorBrainSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="gcolorb-wrap"><div className="gcolorb-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="gcolorb-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="gcolorb-wrap">
      <div className="gcolorb-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="gcolorb-score">{state.score} pts</div>
      <div className="gcolorb-prompt">{r.question}</div>
      <div className="gcolorb-grid">
        {r.choices.map((n, i) => {
          let cls = "gcolorb-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as ColorBrainAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="gcolorb-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as ColorBrainAction)}>Submit</button>}
      {state.submitted && <button className="gcolorb-btn next" onClick={() => dispatch({ type: "next" } as ColorBrainAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
