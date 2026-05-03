import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpiritOfForestState, SpiritOfForestAction, SpiritOfForestSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function SpiritOfForestGame({ state, dispatch, onGameOver }: GameProps<SpiritOfForestState, SpiritOfForestSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-sof-wrap">
      <h3 className="bz-sof-title">Spirit of the Forest</h3>
      <div className="bz-sof-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Assets <b>{state.assets}</b></div>
        <div>Workers <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-sof-actions">
          <button data-testid="hint-target-spirit-of-forest-primary" onClick={() => dispatch({ type: "invest" } as SpiritOfForestAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as SpiritOfForestAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as SpiritOfForestAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as SpiritOfForestAction)}>Trade Asset</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-sof-event">
          <div>{state.lastEvent}</div>
          <button data-testid="hint-target-spirit-of-forest-next" onClick={() => dispatch({ type: "next" } as SpiritOfForestAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-sof-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
