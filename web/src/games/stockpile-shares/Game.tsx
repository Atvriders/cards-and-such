import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StockpileSharesState, StockpileSharesAction, StockpileSharesSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function StockpileSharesGame({ state, dispatch, onGameOver }: GameProps<StockpileSharesState, StockpileSharesSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-ss-wrap">
      <h3 className="bz-ss-title">Stockpile Shares</h3>
      <div className="bz-ss-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Shares <b>{state.assets}</b></div>
        <div>Insider <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-ss-actions">
          <button onClick={() => dispatch({ type: "invest" } as StockpileSharesAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as StockpileSharesAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as StockpileSharesAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as StockpileSharesAction)}>Trade Shares</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-ss-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as StockpileSharesAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-ss-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
