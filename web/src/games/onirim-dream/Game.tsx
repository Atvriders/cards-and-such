import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { OnirimDreamState, OnirimDreamAction, OnirimDreamSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function OnirimDreamGame({ state, dispatch, onGameOver }: GameProps<OnirimDreamState, OnirimDreamSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-ond-wrap">
      <h3 className="bz-ond-title">Onirim</h3>
      <div className="bz-ond-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Assets <b>{state.assets}</b></div>
        <div>Workers <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-ond-actions">
          <button data-testid="hint-target-onirim-dream-primary" onClick={() => dispatch({ type: "invest" } as OnirimDreamAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as OnirimDreamAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as OnirimDreamAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as OnirimDreamAction)}>Trade Asset</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-ond-event">
          <div>{state.lastEvent}</div>
          <button data-testid="hint-target-onirim-dream-next" onClick={() => dispatch({ type: "next" } as OnirimDreamAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-ond-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
