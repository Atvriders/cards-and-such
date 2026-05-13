import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ZoolorettoTruckState, ZoolorettoTruckAction, ZoolorettoTruckSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function ZoolorettoTruckGame({ state, dispatch, onGameOver }: GameProps<ZoolorettoTruckState, ZoolorettoTruckSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-zlt-wrap fade-in">
      <h3 className="bz-zlt-title">Zooloretto Truck</h3>
      <div className="bz-zlt-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Assets <b>{state.assets}</b></div>
        <div>Workers <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-zlt-actions">
          <button data-testid="hint-target-zooloretto-truck-primary" onClick={() => dispatch({ type: "invest" } as ZoolorettoTruckAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as ZoolorettoTruckAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as ZoolorettoTruckAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as ZoolorettoTruckAction)}>Trade Asset</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-zlt-event">
          <div>{state.lastEvent}</div>
          <button data-testid="hint-target-zooloretto-truck-next" onClick={() => dispatch({ type: "next" } as ZoolorettoTruckAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-zlt-done bounce-in">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
