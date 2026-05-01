import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KimsGameState, KimsGameAction, KimsGameSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function KimsGameGame({ state, dispatch, onGameOver }: GameProps<KimsGameState, KimsGameSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const [showTray, setShowTray] = useState(true);
  useEffect(() => {
    setShowTray(true);
    const tm = setTimeout(() => setShowTray(false), 3500);
    return () => clearTimeout(tm);
  }, [state.currentIndex]);

  if (state.phase === "done") {
    return <div className="kimsobs-wrap"><div className="kimsobs-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="kimsobs-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="kimsobs-wrap">
      <div className="kimsobs-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="kimsobs-score">{state.score} pts</div>
      {showTray ? (
        <>
          <div className="kimsobs-prompt">Memorize the tray (3.5s)</div>
          <div className="kimsobs-tray">{r.tray.map((it, i) => <span key={i} className="kimsobs-trayitem">{it}</span>)}</div>
          <button className="kimsobs-btn submit" onClick={() => setShowTray(false)}>Ready</button>
        </>
      ) : (
        <>
          <div className="kimsobs-prompt">{r.question}</div>
          <div className="kimsobs-grid">
            {r.choices.map((n, i) => {
              let cls = "kimsobs-cell";
              if (state.submitted) {
                if (i === r.correct) cls += " correct";
                else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
              } else if (i === state.selected) cls += " selected";
              return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as KimsGameAction)}>{n}</button>;
            })}
          </div>
          {!state.submitted && <button className="kimsobs-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as KimsGameAction)}>Submit</button>}
          {state.submitted && <button className="kimsobs-btn next" onClick={() => dispatch({ type: "next" } as KimsGameAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
        </>
      )}
    </div>
  );
}
