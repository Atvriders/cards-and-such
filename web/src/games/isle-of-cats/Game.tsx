import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { IsleOfCatsState, IsleOfCatsAction, IsleOfCatsSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function IsleOfCatsGame({ state, dispatch, onGameOver }: GameProps<IsleOfCatsState, IsleOfCatsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-ioc-wrap">
      <h3 className="bz-ioc-title">Isle of Cats</h3>
      <div className="bz-ioc-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Assets <b>{state.assets}</b></div>
        <div>Workers <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-ioc-actions">
          <button data-testid="hint-target-isle-of-cats-primary" onClick={() => dispatch({ type: "invest" } as IsleOfCatsAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as IsleOfCatsAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as IsleOfCatsAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as IsleOfCatsAction)}>Trade Asset</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-ioc-event">
          <div>{state.lastEvent}</div>
          <button data-testid="hint-target-isle-of-cats-next" onClick={() => dispatch({ type: "next" } as IsleOfCatsAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-ioc-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
