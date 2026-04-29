import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SplendorMarvelState, SplendorMarvelAction, SplendorMarvelSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function SplendorMarvelGame({ state, dispatch, onGameOver }: GameProps<SplendorMarvelState, SplendorMarvelSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-wrap">
      <h3 className="bz-title">Splendor Marvel</h3>
      <div className="bz-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Hero <b>{state.assets}</b></div>
        <div>Stone <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-actions">
          <button onClick={() => dispatch({ type: "invest" } as SplendorMarvelAction)}>Buy Hero (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as SplendorMarvelAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as SplendorMarvelAction)}>Hire Stone (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as SplendorMarvelAction)}>Sell Hero</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as SplendorMarvelAction)}>Next Turn</button>
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
