import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BrassCanalsState, BrassCanalsAction, BrassCanalsSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function BrassCanalsGame({ state, dispatch, onGameOver }: GameProps<BrassCanalsState, BrassCanalsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-bc-wrap">
      <h3 className="bz-bc-title">Brass Canals</h3>
      <div className="bz-bc-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Mills <b>{state.assets}</b></div>
        <div>Engineer <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-bc-actions">
          <button onClick={() => dispatch({ type: "invest" } as BrassCanalsAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as BrassCanalsAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as BrassCanalsAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as BrassCanalsAction)}>Trade Mills</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-bc-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as BrassCanalsAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-bc-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
