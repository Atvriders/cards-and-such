import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PowerAuctionState, PowerAuctionAction, PowerAuctionSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function PowerAuctionGame({ state, dispatch, onGameOver }: GameProps<PowerAuctionState, PowerAuctionSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-pau-wrap">
      <h3 className="bz-pau-title">Power Plant Auction</h3>
      <div className="bz-pau-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Assets <b>{state.assets}</b></div>
        <div>Workers <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-pau-actions">
          <button data-testid="hint-target-power-auction-primary" onClick={() => dispatch({ type: "invest" } as PowerAuctionAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as PowerAuctionAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as PowerAuctionAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as PowerAuctionAction)}>Trade Asset</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-pau-event">
          <div>{state.lastEvent}</div>
          <button data-testid="hint-target-power-auction-next" onClick={() => dispatch({ type: "next" } as PowerAuctionAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-pau-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
