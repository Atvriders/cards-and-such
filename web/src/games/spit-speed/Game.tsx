import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpitSpeedState, SpitSpeedAction, SpitSpeedSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SpitSpeedGame({ state, dispatch, onGameOver }: GameProps<SpitSpeedState, SpitSpeedSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="gspitsp-wrap"><div className="gspitsp-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="gspitsp-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="gspitsp-wrap">
      <div className="gspitsp-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="gspitsp-score">{state.score} pts</div>
      <div className="gspitsp-prompt">{r.question}</div>
      <div className="gspitsp-grid">
        {r.choices.map((n, i) => {
          let cls = "gspitsp-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button data-testid={`hint-target-spit-speed-answer-${i}`} key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as SpitSpeedAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="gspitsp-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as SpitSpeedAction)}>Submit</button>}
      {state.submitted && <button className="gspitsp-btn next" onClick={() => dispatch({ type: "next" } as SpitSpeedAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
