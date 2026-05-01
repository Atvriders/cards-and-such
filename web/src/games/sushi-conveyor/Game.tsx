import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SushiConveyorState, SushiConveyorAction, SushiConveyorSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function SushiConveyorGame({ state, dispatch, onGameOver }: GameProps<SushiConveyorState, SushiConveyorSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-suc-wrap">
      <h3 className="bz-suc-title">Sushi Conveyor</h3>
      <div className="bz-suc-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Assets <b>{state.assets}</b></div>
        <div>Workers <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-suc-actions">
          <button onClick={() => dispatch({ type: "invest" } as SushiConveyorAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as SushiConveyorAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as SushiConveyorAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as SushiConveyorAction)}>Trade Asset</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-suc-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as SushiConveyorAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-suc-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
