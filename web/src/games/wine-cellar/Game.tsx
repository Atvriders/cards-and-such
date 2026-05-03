import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WineCellarState, WineCellarAction, WineCellarSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function WineCellarGame({ state, dispatch, onGameOver }: GameProps<WineCellarState, WineCellarSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-wcl-wrap">
      <h3 className="bz-wcl-title">Wine Cellar Estate</h3>
      <div className="bz-wcl-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Assets <b>{state.assets}</b></div>
        <div>Workers <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-wcl-actions">
          <button data-testid="hint-target-wine-cellar-primary" onClick={() => dispatch({ type: "invest" } as WineCellarAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as WineCellarAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as WineCellarAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as WineCellarAction)}>Trade Asset</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-wcl-event">
          <div>{state.lastEvent}</div>
          <button data-testid="hint-target-wine-cellar-next" onClick={() => dispatch({ type: "next" } as WineCellarAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-wcl-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
