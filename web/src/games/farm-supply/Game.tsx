import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FarmSupplyState, FarmSupplyAction, FarmSupplySettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function FarmSupplyGame({ state, dispatch, onGameOver }: GameProps<FarmSupplyState, FarmSupplySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-fsp-wrap">
      <h3 className="bz-fsp-title">Farm Supply Crash</h3>
      <div className="bz-fsp-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Assets <b>{state.assets}</b></div>
        <div>Workers <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-fsp-actions">
          <button data-testid="hint-target-farm-supply-primary" onClick={() => dispatch({ type: "invest" } as FarmSupplyAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as FarmSupplyAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as FarmSupplyAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as FarmSupplyAction)}>Trade Asset</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-fsp-event">
          <div>{state.lastEvent}</div>
          <button data-testid="hint-target-farm-supply-next" onClick={() => dispatch({ type: "next" } as FarmSupplyAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-fsp-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
