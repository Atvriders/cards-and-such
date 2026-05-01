import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CharteredRailwayState, CharteredRailwayAction, CharteredRailwaySettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function CharteredRailwayGame({ state, dispatch, onGameOver }: GameProps<CharteredRailwayState, CharteredRailwaySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-cr-wrap">
      <h3 className="bz-cr-title">Chartered Railway</h3>
      <div className="bz-cr-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Assets <b>{state.assets}</b></div>
        <div>Workers <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-cr-actions">
          <button onClick={() => dispatch({ type: "invest" } as CharteredRailwayAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as CharteredRailwayAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as CharteredRailwayAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as CharteredRailwayAction)}>Trade Asset</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-cr-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as CharteredRailwayAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-cr-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
