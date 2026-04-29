import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ObserverCardState, ObserverCardAction, ObserverCardSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function ObserverCardGame({ state, dispatch, onGameOver }: GameProps<ObserverCardState, ObserverCardSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const [showTray, setShowTray] = useState(true);
  useEffect(() => {
    setShowTray(true);
    const tm = setTimeout(() => setShowTray(false), 3500);
    return () => clearTimeout(tm);
  }, [state.currentIndex]);

  if (state.phase === "done") {
    return <div className="gobserv-wrap"><div className="gobserv-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="gobserv-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="gobserv-wrap">
      <div className="gobserv-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="gobserv-score">{state.score} pts</div>
      {showTray ? (
        <>
          <div className="gobserv-prompt">Memorize the tray (3.5s)</div>
          <div className="gobserv-tray">{r.tray.map((it, i) => <span key={i} className="gobserv-trayitem">{it}</span>)}</div>
          <button className="gobserv-btn submit" onClick={() => setShowTray(false)}>Ready</button>
        </>
      ) : (
        <>
          <div className="gobserv-prompt">{r.question}</div>
          <div className="gobserv-grid">
            {r.choices.map((n, i) => {
              let cls = "gobserv-cell";
              if (state.submitted) {
                if (i === r.correct) cls += " correct";
                else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
              } else if (i === state.selected) cls += " selected";
              return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as ObserverCardAction)}>{n}</button>;
            })}
          </div>
          {!state.submitted && <button className="gobserv-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as ObserverCardAction)}>Submit</button>}
          {state.submitted && <button className="gobserv-btn next" onClick={() => dispatch({ type: "next" } as ObserverCardAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
        </>
      )}
    </div>
  );
}
