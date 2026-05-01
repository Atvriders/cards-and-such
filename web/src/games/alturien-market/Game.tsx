import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AlturienMarketState, AlturienMarketAction, AlturienMarketSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function AlturienMarketGame({ state, dispatch, onGameOver }: GameProps<AlturienMarketState, AlturienMarketSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-alt-wrap">
      <h3 className="bz-alt-title">Alturien Market</h3>
      <div className="bz-alt-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Goods <b>{state.assets}</b></div>
        <div>Trader <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-alt-actions">
          <button onClick={() => dispatch({ type: "invest" } as AlturienMarketAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as AlturienMarketAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as AlturienMarketAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as AlturienMarketAction)}>Trade Goods</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-alt-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as AlturienMarketAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-alt-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
