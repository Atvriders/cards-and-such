import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PonziCollapseState, PonziCollapseAction, PonziCollapseSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function PonziCollapseGame({ state, dispatch, onGameOver }: GameProps<PonziCollapseState, PonziCollapseSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-pcz-wrap">
      <h3 className="bz-pcz-title">Ponzi Collapse</h3>
      <div className="bz-pcz-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Investors <b>{state.assets}</b></div>
        <div>Recruiter <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-pcz-actions">
          <button onClick={() => dispatch({ type: "invest" } as PonziCollapseAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as PonziCollapseAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as PonziCollapseAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as PonziCollapseAction)}>Trade Investors</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-pcz-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as PonziCollapseAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-pcz-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
