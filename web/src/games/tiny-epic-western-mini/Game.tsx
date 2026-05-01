import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TinyEpicWesternState, TinyEpicWesternAction, TinyEpicWesternSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function TinyEpicWesternGame({ state, dispatch, onGameOver }: GameProps<TinyEpicWesternState, TinyEpicWesternSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-tewm-wrap">
      <h3 className="bz-tewm-title">Tiny Epic Western</h3>
      <div className="bz-tewm-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Saloons <b>{state.assets}</b></div>
        <div>Sheriff <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-tewm-actions">
          <button onClick={() => dispatch({ type: "invest" } as TinyEpicWesternAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as TinyEpicWesternAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as TinyEpicWesternAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as TinyEpicWesternAction)}>Trade Saloons</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-tewm-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as TinyEpicWesternAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-tewm-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
