import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SplendorMerchantState, SplendorMerchantAction, SplendorMerchantSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function SplendorMerchantGame({ state, dispatch, onGameOver }: GameProps<SplendorMerchantState, SplendorMerchantSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-wrap">
      <h3 className="bz-title">Splendor Merchant</h3>
      <div className="bz-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Assets <b>{state.assets}</b></div>
        <div>Workers <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-actions">
          <button onClick={() => dispatch({ type: "invest" } as SplendorMerchantAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as SplendorMerchantAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as SplendorMerchantAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as SplendorMerchantAction)}>Trade Asset</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as SplendorMerchantAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
