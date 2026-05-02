import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardTunnelState, CardTunnelAction, CardTunnelSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function CardTunnelGame({ state, dispatch, onGameOver }: GameProps<CardTunnelState, CardTunnelSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="cm-score">{state.score} pts</div>
      {state.card !== null && (
        <div className="cm-row">
          <div className={`cm-card ${isRed(state.card) ? "red" : "black"}`}>{cardName(state.card)}</div>
        </div>
      )}
      {state.phase === "draw" && (
        <button data-testid="hint-target-card-tunnel-primary" className="cm-btn" onClick={() => dispatch({ type:"draw" } as CardTunnelAction)}>Draw</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="cm-result">Light: +{state.lastPts}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as CardTunnelAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
