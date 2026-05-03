import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AgricolaCardOnlyState, AgricolaCardOnlyAction, AgricolaCardOnlySettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function AgricolaCardOnlyGame({ state, dispatch, onGameOver }: GameProps<AgricolaCardOnlyState, AgricolaCardOnlySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-aco-wrap">
      <h3 className="bz-aco-title">Agricola Card-Only</h3>
      <div className="bz-aco-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Field <b>{state.assets}</b></div>
        <div>Occupation <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-aco-actions">
          <button data-testid="hint-target-agricola-card-only-primary" onClick={() => dispatch({ type: "invest" } as AgricolaCardOnlyAction)}>Buy Field (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as AgricolaCardOnlyAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as AgricolaCardOnlyAction)}>Hire Occupation (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as AgricolaCardOnlyAction)}>Sell Field</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-aco-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as AgricolaCardOnlyAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-aco-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
