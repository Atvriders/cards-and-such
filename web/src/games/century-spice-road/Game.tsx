import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CenturySpiceRoadState, CenturySpiceRoadAction, CenturySpiceRoadSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function CenturySpiceRoadGame({ state, dispatch, onGameOver }: GameProps<CenturySpiceRoadState, CenturySpiceRoadSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-csr-wrap">
      <h3 className="bz-csr-title">Century Spice Road</h3>
      <div className="bz-csr-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Spice <b>{state.assets}</b></div>
        <div>Caravan <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-csr-actions">
          <button onClick={() => dispatch({ type: "invest" } as CenturySpiceRoadAction)}>Buy Spice (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as CenturySpiceRoadAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as CenturySpiceRoadAction)}>Hire Caravan (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as CenturySpiceRoadAction)}>Sell Spice</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-csr-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as CenturySpiceRoadAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-csr-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
