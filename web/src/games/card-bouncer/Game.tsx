import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardBouncerState, CardBouncerAction, CardBouncerSettings } from "./state.js";
import { isTerminal, cardName, isRed, rankOf, TOTAL_DRAWS } from "./state.js";
import "./Game.css";

export function CardBouncerGame({ state, dispatch, onGameOver }: GameProps<CardBouncerState, CardBouncerSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cb-wrap"><div className="cb-done"><h2>Done!</h2><div className="cb-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cb-wrap">
      <div className="cb-info">Draw {state.draw} / {TOTAL_DRAWS}</div>
      <div className="cb-score">{state.score} pts</div>
      <div className="cb-info">Bounces used: {state.bounceCount} / 1</div>
      {state.current !== null && (
        <>
          <div className={`cb-card ${isRed(state.current) ? "red" : "black"}`}>{cardName(state.current)}<div className="cb-rank">+{rankOf(state.current)}</div></div>
          <div className="cb-row">
            <button className="cb-btn" onClick={() => dispatch({ type: "accept" } as CardBouncerAction)}>Accept</button>
            <button className="cb-btn alt" disabled={state.bounceCount >= 1} onClick={() => dispatch({ type: "reject" } as CardBouncerAction)}>Reject</button>
          </div>
        </>
      )}
    </div>
  );
}
