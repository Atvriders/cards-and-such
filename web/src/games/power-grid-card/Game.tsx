import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PowerGridCardState, PowerGridCardAction, PowerGridCardSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function PowerGridCardGame({ state, dispatch, onGameOver }: GameProps<PowerGridCardState, PowerGridCardSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-pgc-wrap">
      <h3 className="bz-pgc-title">Power Grid Card Game</h3>
      <div className="bz-pgc-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Plant <b>{state.assets}</b></div>
        <div>Engineer <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-pgc-actions">
          <button data-testid="hint-target-power-grid-card-primary" onClick={() => dispatch({ type: "invest" } as PowerGridCardAction)}>Buy Plant (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as PowerGridCardAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as PowerGridCardAction)}>Hire Engineer (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as PowerGridCardAction)}>Sell Plant</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-pgc-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as PowerGridCardAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-pgc-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
