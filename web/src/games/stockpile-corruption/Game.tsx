import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StockpileCorruptionState, StockpileCorruptionAction, StockpileCorruptionSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function StockpileCorruptionGame({ state, dispatch, onGameOver }: GameProps<StockpileCorruptionState, StockpileCorruptionSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-sc-wrap">
      <h3 className="bz-sc-title">Stockpile Continuing Corruption</h3>
      <div className="bz-sc-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Shares <b>{state.assets}</b></div>
        <div>Insider <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-sc-actions">
          <button onClick={() => dispatch({ type: "invest" } as StockpileCorruptionAction)}>Buy Shares (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as StockpileCorruptionAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as StockpileCorruptionAction)}>Hire Insider (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as StockpileCorruptionAction)}>Sell Shares</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-sc-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as StockpileCorruptionAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-sc-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
