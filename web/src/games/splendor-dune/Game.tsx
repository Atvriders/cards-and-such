import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SplendorDuneState, SplendorDuneAction, SplendorDuneSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function SplendorDuneGame({ state, dispatch, onGameOver }: GameProps<SplendorDuneState, SplendorDuneSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-wrap">
      <h3 className="bz-title">Splendor Dune</h3>
      <div className="bz-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Spice <b>{state.assets}</b></div>
        <div>Mentat <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-actions">
          <button onClick={() => dispatch({ type: "invest" } as SplendorDuneAction)}>Buy Spice (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as SplendorDuneAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as SplendorDuneAction)}>Hire Mentat (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as SplendorDuneAction)}>Sell Spice</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as SplendorDuneAction)}>Next Turn</button>
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
