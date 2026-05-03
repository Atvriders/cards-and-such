import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BullBearMarketState, BullBearMarketAction, BullBearMarketSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function BullBearMarketGame({ state, dispatch, onGameOver }: GameProps<BullBearMarketState, BullBearMarketSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-bbm-wrap">
      <h3 className="bz-bbm-title">Bull & Bear Market</h3>
      <div className="bz-bbm-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Stocks <b>{state.assets}</b></div>
        <div>Broker <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-bbm-actions">
          <button data-testid="hint-target-bull-bear-market-primary" onClick={() => dispatch({ type: "invest" } as BullBearMarketAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as BullBearMarketAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as BullBearMarketAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as BullBearMarketAction)}>Trade Stocks</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-bbm-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as BullBearMarketAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-bbm-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
