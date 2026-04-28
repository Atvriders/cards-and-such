import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ScovillePeppersState, ScovillePeppersAction, ScovillePeppersSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function ScovillePeppersGame({ state, dispatch, onGameOver }: GameProps<ScovillePeppersState, ScovillePeppersSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-wrap">
      <h3 className="bz-title">Scoville Peppers</h3>
      <div className="bz-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Peppers <b>{state.assets}</b></div>
        <div>Grower <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-actions">
          <button onClick={() => dispatch({ type: "invest" } as ScovillePeppersAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as ScovillePeppersAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as ScovillePeppersAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as ScovillePeppersAction)}>Trade Peppers</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as ScovillePeppersAction)}>Next Turn</button>
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
