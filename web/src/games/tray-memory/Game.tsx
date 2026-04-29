import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TrayMemoryState, TrayMemoryAction, TrayMemorySettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function TrayMemoryGame({ state, dispatch, onGameOver }: GameProps<TrayMemoryState, TrayMemorySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const [showTray, setShowTray] = useState(true);
  useEffect(() => {
    setShowTray(true);
    const tm = setTimeout(() => setShowTray(false), 3500);
    return () => clearTimeout(tm);
  }, [state.currentIndex]);

  if (state.phase === "done") {
    return <div className="gtrayme-wrap"><div className="gtrayme-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="gtrayme-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="gtrayme-wrap">
      <div className="gtrayme-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="gtrayme-score">{state.score} pts</div>
      {showTray ? (
        <>
          <div className="gtrayme-prompt">Memorize the tray (3.5s)</div>
          <div className="gtrayme-tray">{r.tray.map((it, i) => <span key={i} className="gtrayme-trayitem">{it}</span>)}</div>
          <button className="gtrayme-btn submit" onClick={() => setShowTray(false)}>Ready</button>
        </>
      ) : (
        <>
          <div className="gtrayme-prompt">{r.question}</div>
          <div className="gtrayme-grid">
            {r.choices.map((n, i) => {
              let cls = "gtrayme-cell";
              if (state.submitted) {
                if (i === r.correct) cls += " correct";
                else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
              } else if (i === state.selected) cls += " selected";
              return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as TrayMemoryAction)}>{n}</button>;
            })}
          </div>
          {!state.submitted && <button className="gtrayme-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as TrayMemoryAction)}>Submit</button>}
          {state.submitted && <button className="gtrayme-btn next" onClick={() => dispatch({ type: "next" } as TrayMemoryAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
        </>
      )}
    </div>
  );
}
