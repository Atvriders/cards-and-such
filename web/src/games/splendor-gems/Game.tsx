import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SplendorGemsState, SplendorGemsAction, SplendorGemsSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function SplendorGemsGame({ state, dispatch, onGameOver }: GameProps<SplendorGemsState, SplendorGemsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-wrap">
      <h3 className="bz-title">Splendor Gems</h3>
      <div className="bz-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Gems <b>{state.assets}</b></div>
        <div>Noble <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-actions">
          <button onClick={() => dispatch({ type: "invest" } as SplendorGemsAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as SplendorGemsAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as SplendorGemsAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as SplendorGemsAction)}>Trade Gems</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as SplendorGemsAction)}>Next Turn</button>
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
