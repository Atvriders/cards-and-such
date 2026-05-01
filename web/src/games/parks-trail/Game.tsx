import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ParksTrailState, ParksTrailAction, ParksTrailSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function ParksTrailGame({ state, dispatch, onGameOver }: GameProps<ParksTrailState, ParksTrailSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-prt-wrap">
      <h3 className="bz-prt-title">Parks Trail</h3>
      <div className="bz-prt-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Assets <b>{state.assets}</b></div>
        <div>Workers <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-prt-actions">
          <button onClick={() => dispatch({ type: "invest" } as ParksTrailAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as ParksTrailAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as ParksTrailAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as ParksTrailAction)}>Trade Asset</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-prt-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as ParksTrailAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-prt-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
