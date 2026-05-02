import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SwapStackState, SwapStackAction, SwapStackSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function SwapStackGame({ state, dispatch, onGameOver }: GameProps<SwapStackState, SwapStackSettings>): JSX.Element {
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
        <div className={`cm-card ${isRed(state.card) ? "red" : "black"}`}>{cardName(state.card)}</div>
      )}
      {state.phase === "decide" && (
        <div className="cm-row">
          <button data-testid="hint-target-swap-stack-primary" className="cm-btn" onClick={() => dispatch({ type:"keep" } as SwapStackAction)}>Keep</button>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"swap" } as SwapStackAction)}>Swap</button>
        </div>
      )}
      {state.phase === "scored" && (
        <>
          <div className="cm-result">{state.swapped ? `Swapped! +${state.pts}` : `Kept. +${state.pts}`}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as SwapStackAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
