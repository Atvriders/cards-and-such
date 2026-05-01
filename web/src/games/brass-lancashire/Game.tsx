import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BrassLancashireState, BrassLancashireAction, BrassLancashireSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function BrassLancashireGame({ state, dispatch, onGameOver }: GameProps<BrassLancashireState, BrassLancashireSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-bla-wrap">
      <h3 className="bz-bla-title">Brass Lancashire</h3>
      <div className="bz-bla-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Mill <b>{state.assets}</b></div>
        <div>Engineer <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-bla-actions">
          <button onClick={() => dispatch({ type: "invest" } as BrassLancashireAction)}>Buy Mill (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as BrassLancashireAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as BrassLancashireAction)}>Hire Engineer (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as BrassLancashireAction)}>Sell Mill</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-bla-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as BrassLancashireAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-bla-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
