import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HotelAcquisitionState, HotelAcquisitionAction, HotelAcquisitionSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function HotelAcquisitionGame({ state, dispatch, onGameOver }: GameProps<HotelAcquisitionState, HotelAcquisitionSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-wrap">
      <h3 className="bz-title">Hotel Acquisition</h3>
      <div className="bz-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Assets <b>{state.assets}</b></div>
        <div>Workers <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-actions">
          <button onClick={() => dispatch({ type: "invest" } as HotelAcquisitionAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as HotelAcquisitionAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as HotelAcquisitionAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as HotelAcquisitionAction)}>Trade Asset</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as HotelAcquisitionAction)}>Next Turn</button>
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
