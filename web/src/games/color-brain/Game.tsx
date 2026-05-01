import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ColorBrainState, ColorBrainAction, ColorBrainSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function ColorBrainGame({ state, dispatch, onGameOver }: GameProps<ColorBrainState, ColorBrainSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="clrbrn-wrap"><div className="clrbrn-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="clrbrn-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="clrbrn-wrap">
      <div className="clrbrn-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="clrbrn-score">{state.score} pts</div>
      <div className="clrbrn-prompt">{r.question}</div>
      <div className="clrbrn-grid">
        {r.choices.map((n, i) => {
          let cls = "clrbrn-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as ColorBrainAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="clrbrn-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as ColorBrainAction)}>Submit</button>}
      {state.submitted && <button className="clrbrn-btn next" onClick={() => dispatch({ type: "next" } as ColorBrainAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
