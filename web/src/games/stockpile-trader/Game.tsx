import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StockpileTraderState, StockpileTraderAction, StockpileTraderSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function StockpileTraderGame({ state, dispatch, onGameOver }: GameProps<StockpileTraderState, StockpileTraderSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-spt-wrap fade-in">
      <h3 className="bz-spt-title">Stockpile Trader</h3>
      <div className="bz-spt-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Assets <b>{state.assets}</b></div>
        <div>Workers <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-spt-actions">
          <button data-testid="hint-target-stockpile-trader-primary" onClick={() => dispatch({ type: "invest" } as StockpileTraderAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as StockpileTraderAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as StockpileTraderAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as StockpileTraderAction)}>Trade Asset</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-spt-event">
          <div>{state.lastEvent}</div>
          <button data-testid="hint-target-stockpile-trader-next" onClick={() => dispatch({ type: "next" } as StockpileTraderAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-spt-done bounce-in">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
