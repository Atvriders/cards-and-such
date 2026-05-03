import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CoffeeTradersMiniState, CoffeeTradersMiniAction, CoffeeTradersMiniSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function CoffeeTradersMiniGame({ state, dispatch, onGameOver }: GameProps<CoffeeTradersMiniState, CoffeeTradersMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-ctm-wrap">
      <h3 className="bz-ctm-title">Coffee Traders Mini</h3>
      <div className="bz-ctm-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Beans <b>{state.assets}</b></div>
        <div>Roaster <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-ctm-actions">
          <button data-testid="hint-target-coffee-traders-mini-primary" onClick={() => dispatch({ type: "invest" } as CoffeeTradersMiniAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as CoffeeTradersMiniAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as CoffeeTradersMiniAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as CoffeeTradersMiniAction)}>Trade Beans</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-ctm-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as CoffeeTradersMiniAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-ctm-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
