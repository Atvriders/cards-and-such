import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AgricolaCreaturesState, AgricolaCreaturesAction, AgricolaCreaturesSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function AgricolaCreaturesGame({ state, dispatch, onGameOver }: GameProps<AgricolaCreaturesState, AgricolaCreaturesSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-ac-wrap">
      <h3 className="bz-ac-title">Agricola All Creatures</h3>
      <div className="bz-ac-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Livestock <b>{state.assets}</b></div>
        <div>Shepherd <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-ac-actions">
          <button onClick={() => dispatch({ type: "invest" } as AgricolaCreaturesAction)}>Buy Livestock (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as AgricolaCreaturesAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as AgricolaCreaturesAction)}>Hire Shepherd (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as AgricolaCreaturesAction)}>Sell Livestock</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-ac-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as AgricolaCreaturesAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-ac-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
