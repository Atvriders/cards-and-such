import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FoodRestaurantState, FoodRestaurantAction, FoodRestaurantSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function FoodRestaurantGame({ state, dispatch, onGameOver }: GameProps<FoodRestaurantState, FoodRestaurantSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-fre-wrap fade-in">
      <h3 className="bz-fre-title">Food Chain Restaurant</h3>
      <div className="bz-fre-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Assets <b>{state.assets}</b></div>
        <div>Workers <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-fre-actions">
          <button data-testid="hint-target-food-restaurant-primary" onClick={() => dispatch({ type: "invest" } as FoodRestaurantAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as FoodRestaurantAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as FoodRestaurantAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as FoodRestaurantAction)}>Trade Asset</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-fre-event">
          <div>{state.lastEvent}</div>
          <button data-testid="hint-target-food-restaurant-next" onClick={() => dispatch({ type: "next" } as FoodRestaurantAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-fre-done bounce-in">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
