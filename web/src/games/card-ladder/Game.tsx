import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardLadderState, CardLadderAction, CardLadderSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_DRAWS } from "./state.js";
import "./Game.css";

export function CardLadderGame({ state, dispatch, onGameOver }: GameProps<CardLadderState, CardLadderSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div>Best ladder: {state.bestRun}</div><div className="cm-final">{state.score} pts</div></div></div>;
  }
  const last = state.drawn[state.drawn.length - 1];
  return (
    <div className="cm-wrap">
      <div className="cm-info">Draw {state.draws} / {TOTAL_DRAWS} — Run: {state.currentRun} — Best: {state.bestRun}</div>
      {last !== undefined && (
        <div className="cm-row">
          <div className={`cm-card ${isRed(last) ? "red" : "black"}`}>{cardName(last)}</div>
        </div>
      )}
      <button data-testid="hint-target-card-ladder-primary" className="cm-btn" onClick={() => dispatch({ type:"draw" } as CardLadderAction)}>Draw</button>
    </div>
  );
}
