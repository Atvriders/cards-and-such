import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TuscanyEssentialState, TuscanyEssentialAction, TuscanyEssentialSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function TuscanyEssentialGame({ state, dispatch, onGameOver }: GameProps<TuscanyEssentialState, TuscanyEssentialSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-tus-wrap">
      <h3 className="bz-tus-title">Tuscany Essential</h3>
      <div className="bz-tus-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Assets <b>{state.assets}</b></div>
        <div>Workers <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-tus-actions">
          <button data-testid="hint-target-tuscany-essential-primary" onClick={() => dispatch({ type: "invest" } as TuscanyEssentialAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as TuscanyEssentialAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as TuscanyEssentialAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as TuscanyEssentialAction)}>Trade Asset</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-tus-event">
          <div>{state.lastEvent}</div>
          <button data-testid="hint-target-tuscany-essential-next" onClick={() => dispatch({ type: "next" } as TuscanyEssentialAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-tus-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
