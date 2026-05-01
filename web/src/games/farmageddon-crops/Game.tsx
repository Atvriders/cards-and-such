import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FarmageddonCropsState, FarmageddonCropsAction, FarmageddonCropsSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function FarmageddonCropsGame({ state, dispatch, onGameOver }: GameProps<FarmageddonCropsState, FarmageddonCropsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-fc-wrap">
      <h3 className="bz-fc-title">Farmageddon Crops</h3>
      <div className="bz-fc-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Crops <b>{state.assets}</b></div>
        <div>Farmhand <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-fc-actions">
          <button onClick={() => dispatch({ type: "invest" } as FarmageddonCropsAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as FarmageddonCropsAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as FarmageddonCropsAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as FarmageddonCropsAction)}>Trade Crops</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-fc-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as FarmageddonCropsAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-fc-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
