import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CavernaCaveVsCaveState, CavernaCaveVsCaveAction, CavernaCaveVsCaveSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function CavernaCaveVsCaveGame({ state, dispatch, onGameOver }: GameProps<CavernaCaveVsCaveState, CavernaCaveVsCaveSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-cvc-wrap">
      <h3 className="bz-cvc-title">Caverna: Cave vs Cave</h3>
      <div className="bz-cvc-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Assets <b>{state.assets}</b></div>
        <div>Workers <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-cvc-actions">
          <button data-testid="hint-target-caverna-cave-vs-cave-primary" onClick={() => dispatch({ type: "invest" } as CavernaCaveVsCaveAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as CavernaCaveVsCaveAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as CavernaCaveVsCaveAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as CavernaCaveVsCaveAction)}>Trade Asset</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-cvc-event">
          <div>{state.lastEvent}</div>
          <button data-testid="hint-target-caverna-cave-vs-cave-next" onClick={() => dispatch({ type: "next" } as CavernaCaveVsCaveAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-cvc-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
