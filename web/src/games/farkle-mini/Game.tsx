import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FarkleMiniState, FarkleMiniAction, FarkleMiniSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function FarkleMiniGame({ state, dispatch, onGameOver }: GameProps<FarkleMiniState, FarkleMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.totalScore} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">Total: {state.totalScore} | Bank: {state.roundBank}</div>
      {state.dice.length > 0 && (
        <div className="dm-row">
          {state.dice.map((d, i) => (
            <div key={i} className={`dm-die ${d === 1 || d === 5 ? "scoring" : ""}`}>{d}</div>
          ))}
        </div>
      )}
      <div className="dm-info">Dice next: {state.remaining}</div>
      {state.phase === "rolling" && (
        <button className="dm-btn" onClick={() => dispatch({ type:"roll" } as FarkleMiniAction)}>Roll {state.remaining}</button>
      )}
      {state.phase === "decide" && (
        <div className="dm-row">
          <button className="dm-btn" onClick={() => dispatch({ type:"roll" } as FarkleMiniAction)}>Roll {state.remaining} more</button>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"bank" } as FarkleMiniAction)}>Bank {state.roundBank}</button>
        </div>
      )}
      {state.phase === "scored" && (
        <>
          <div className="dm-result">{state.lastFarkle ? "FARKLE! Round bank lost." : `Round banked: ${state.roundBank > 0 ? state.roundBank : 0}`}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as FarkleMiniAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
