import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GamedlePixelState, GamedlePixelAction, GamedlePixelSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function GamedlePixelGame({ state, dispatch, onGameOver }: GameProps<GamedlePixelState, GamedlePixelSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ggamedl-wrap"><div className="ggamedl-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="ggamedl-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="ggamedl-wrap">
      <div className="ggamedl-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="ggamedl-score">{state.score} pts</div>
      <div className="ggamedl-prompt">{r.question}</div>
      <div className="ggamedl-grid">
        {r.choices.map((n, i) => {
          let cls = "ggamedl-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as GamedlePixelAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="ggamedl-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as GamedlePixelAction)}>Submit</button>}
      {state.submitted && <button className="ggamedl-btn next" onClick={() => dispatch({ type: "next" } as GamedlePixelAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
