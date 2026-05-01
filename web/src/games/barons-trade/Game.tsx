import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BaronsTradeState, BaronsTradeAction, BaronsTradeSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function BaronsTradeGame({ state, dispatch, onGameOver }: GameProps<BaronsTradeState, BaronsTradeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-bt-wrap">
      <h3 className="bz-bt-title">Barons of Trade</h3>
      <div className="bz-bt-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Assets <b>{state.assets}</b></div>
        <div>Workers <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-bt-actions">
          <button onClick={() => dispatch({ type: "invest" } as BaronsTradeAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as BaronsTradeAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as BaronsTradeAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as BaronsTradeAction)}>Trade Asset</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-bt-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as BaronsTradeAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-bt-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
