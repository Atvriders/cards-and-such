import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardSnap3State, CardSnap3Action, CardSnap3Settings } from "./state.js";
import { isTerminal, cardName, isSnappable } from "./state.js";
import "./Game.css";

export function CardSnap3({ state, dispatch, onGameOver }: GameProps<CardSnap3State, CardSnap3Settings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const snappable = isSnappable(state.history);

  if (state.phase === "gameover") return (
    <div className="cs3-wrap"><div className="cs3-done">
      <h2>Game Over!</h2>
      <p>Snaps: {state.snaps} | Misses: {state.misses}</p>
      <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#e67e22" }}>{state.score} pts</p>
    </div></div>
  );

  return (
    <div className="cs3-wrap">
      <div className="cs3-header">
        <span>Card {state.round} / {state.maxRounds}</span>
        <span className="cs3-score">{state.score} pts</span>
      </div>
      <div className="cs3-history">
        {state.history.length === 0 && <span className="cs3-empty">Flip a card to start</span>}
        {state.history.map((c, i) => <span key={i} className="cs3-card">{cardName(c)}</span>)}
      </div>
      {state.lastSnap && (
        <div className={`cs3-feedback ${state.lastSnap}`}>{state.lastSnap === "correct" ? "SNAP! +50" : "Wrong snap! -20"}</div>
      )}
      {snappable && !state.lastSnap && <div className="cs3-alert">3 in a row! SNAP it!</div>}
      <div className="cs3-actions">
        <button data-testid="hint-target-card-snap-3-flip" className="cs3-btn flip" onClick={() => dispatch({ type: "flip" } as CardSnap3Action)}>Flip</button>
        <button data-testid="hint-target-card-snap-3-snap" className={`cs3-btn snap ${snappable ? "hot" : ""}`} onClick={() => dispatch({ type: "snap" } as CardSnap3Action)}>SNAP</button>
      </div>
    </div>
  );
}
