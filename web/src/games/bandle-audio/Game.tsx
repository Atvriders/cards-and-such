import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BandleAudioState, BandleAudioAction, BandleAudioSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function BandleAudioGame({ state, dispatch, onGameOver }: GameProps<BandleAudioState, BandleAudioSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="gbandle-wrap"><div className="gbandle-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="gbandle-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="gbandle-wrap">
      <div className="gbandle-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="gbandle-score">{state.score} pts</div>
      <div className="gbandle-prompt">{r.question}</div>
      <div className="gbandle-grid">
        {r.choices.map((n, i) => {
          let cls = "gbandle-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button data-testid={`hint-target-bandle-audio-answer-${i}`} key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as BandleAudioAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="gbandle-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as BandleAudioAction)}>Submit</button>}
      {state.submitted && <button className="gbandle-btn next" onClick={() => dispatch({ type: "next" } as BandleAudioAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
