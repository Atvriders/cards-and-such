import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CenturyGolemEditionState, CenturyGolemEditionAction, CenturyGolemEditionSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function CenturyGolemEditionGame({ state, dispatch, onGameOver }: GameProps<CenturyGolemEditionState, CenturyGolemEditionSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-cge-wrap">
      <h3 className="bz-cge-title">Century Golem Edition</h3>
      <div className="bz-cge-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Crystal <b>{state.assets}</b></div>
        <div>Apprentice <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-cge-actions">
          <button onClick={() => dispatch({ type: "invest" } as CenturyGolemEditionAction)}>Buy Crystal (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as CenturyGolemEditionAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as CenturyGolemEditionAction)}>Hire Apprentice (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as CenturyGolemEditionAction)}>Sell Crystal</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-cge-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as CenturyGolemEditionAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-cge-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
