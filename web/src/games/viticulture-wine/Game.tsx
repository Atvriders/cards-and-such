import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ViticultureWineState, ViticultureWineAction, ViticultureWineSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function ViticultureWineGame({ state, dispatch, onGameOver }: GameProps<ViticultureWineState, ViticultureWineSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-vw-wrap">
      <h3 className="bz-vw-title">Viticulture Wine Estate</h3>
      <div className="bz-vw-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Vine <b>{state.assets}</b></div>
        <div>Visitor <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-vw-actions">
          <button onClick={() => dispatch({ type: "invest" } as ViticultureWineAction)}>Buy Vine (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as ViticultureWineAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as ViticultureWineAction)}>Hire Visitor (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as ViticultureWineAction)}>Sell Vine</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-vw-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as ViticultureWineAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-vw-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
