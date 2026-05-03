import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SuburbiaIncState, SuburbiaIncAction, SuburbiaIncSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function SuburbiaIncGame({ state, dispatch, onGameOver }: GameProps<SuburbiaIncState, SuburbiaIncSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-wrap">
      <h3 className="bz-title">Suburbia Inc</h3>
      <div className="bz-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Tile <b>{state.assets}</b></div>
        <div>Bonus <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-actions">
          <button data-testid="hint-target-suburbia-inc-primary" onClick={() => dispatch({ type: "invest" } as SuburbiaIncAction)}>Buy Tile (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as SuburbiaIncAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as SuburbiaIncAction)}>Hire Bonus (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as SuburbiaIncAction)}>Sell Tile</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as SuburbiaIncAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
