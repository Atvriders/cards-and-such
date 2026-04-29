import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BlinkSpeedState, BlinkSpeedAction, BlinkSpeedSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function BlinkSpeedGame({ state, dispatch, onGameOver }: GameProps<BlinkSpeedState, BlinkSpeedSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="blinkspeed-wrap"><div className="blinkspeed-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="blinkspeed-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="blinkspeed-wrap">
      <div className="blinkspeed-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="blinkspeed-score">{state.score} pts</div>
      <div className="blinkspeed-prompt">{r.question}</div>
      <div className="blinkspeed-grid">
        {r.choices.map((n, i) => {
          let cls = "blinkspeed-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as BlinkSpeedAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="blinkspeed-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as BlinkSpeedAction)}>Submit</button>}
      {state.submitted && <button className="blinkspeed-btn next" onClick={() => dispatch({ type: "next" } as BlinkSpeedAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
