import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CoffeeExportState, CoffeeExportAction, CoffeeExportSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function CoffeeExportGame({ state, dispatch, onGameOver }: GameProps<CoffeeExportState, CoffeeExportSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-ce-wrap">
      <h3 className="bz-ce-title">Coffee Export Chain</h3>
      <div className="bz-ce-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Assets <b>{state.assets}</b></div>
        <div>Workers <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-ce-actions">
          <button onClick={() => dispatch({ type: "invest" } as CoffeeExportAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as CoffeeExportAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as CoffeeExportAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as CoffeeExportAction)}>Trade Asset</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-ce-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as CoffeeExportAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-ce-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
