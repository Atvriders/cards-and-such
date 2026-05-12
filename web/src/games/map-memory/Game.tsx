import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MapMemoryState, MapMemoryAction, MapMemorySettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function MapMemoryGame({ state, dispatch, onGameOver }: GameProps<MapMemoryState, MapMemorySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="mapmem-wrap"><div className="mapmem-done bounce-in"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="mapmem-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="mapmem-wrap fade-in">
      <div className="mapmem-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="mapmem-score pulse">{state.score} pts</div>
      <div className="mapmem-prompt">{r.question}</div>
      <div className="mapmem-grid">
        {r.choices.map((n, i) => {
          let cls = "mapmem-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button data-testid={`hint-target-map-memory-answer-${i}`} key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as MapMemoryAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="mapmem-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as MapMemoryAction)}>Submit</button>}
      {state.submitted && <button className="mapmem-btn next" onClick={() => dispatch({ type: "next" } as MapMemoryAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
