import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BaronsEngineState, BaronsEngineAction, BaronsEngineSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function BaronsEngineGame({ state, dispatch, onGameOver }: GameProps<BaronsEngineState, BaronsEngineSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-ben-wrap">
      <h3 className="bz-ben-title">Barons Engine</h3>
      <div className="bz-ben-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Mines <b>{state.assets}</b></div>
        <div>Foreman <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-ben-actions">
          <button onClick={() => dispatch({ type: "invest" } as BaronsEngineAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as BaronsEngineAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as BaronsEngineAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as BaronsEngineAction)}>Trade Mines</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-ben-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as BaronsEngineAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-ben-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
