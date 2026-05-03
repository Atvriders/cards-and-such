import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ShitheadState, ShitheadAction, ShitheadSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function ShitheadGame({ state, dispatch, onGameOver }: GameProps<ShitheadState, ShitheadSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="shithead-wrap shit-shed"><div className="shithead-done"><h2>Done!</h2><div>W: {state.wins} L: {state.losses}</div><div className="shithead-final">{state.score} pts</div></div></div>;
  return (
    <div className="shithead-wrap shit-shed">
      <div className="shithead-info">Round {state.round} / {TOTAL_ROUNDS} — W{state.wins} L{state.losses}</div>
      <div className="shithead-score">{state.score} pts</div>
      <div className="shithead-info">You: {state.you} cards · CPU: {state.cpu} cards</div>
      {state.phase === "ready" && <button data-testid="hint-target-shithead-primary" className="shithead-btn" onClick={() => dispatch({ type: "play" } as ShitheadAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="shithead-result">{state.result}</div>
        <button data-testid="hint-target-shithead-next" className="shithead-btn alt" onClick={() => dispatch({ type: "next" } as ShitheadAction)}>Next</button>
      </>}
    </div>
  );
}
