import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MonopolyDealMiniState, MonopolyDealMiniAction, MonopolyDealMiniSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function MonopolyDealMiniGame({ state, dispatch, onGameOver }: GameProps<MonopolyDealMiniState, MonopolyDealMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-mdm-wrap">
      <h3 className="bz-mdm-title">Monopoly Deal Mini</h3>
      <div className="bz-mdm-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Properties <b>{state.assets}</b></div>
        <div>Tenant <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-mdm-actions">
          <button onClick={() => dispatch({ type: "invest" } as MonopolyDealMiniAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as MonopolyDealMiniAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as MonopolyDealMiniAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as MonopolyDealMiniAction)}>Trade Properties</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-mdm-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as MonopolyDealMiniAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-mdm-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
