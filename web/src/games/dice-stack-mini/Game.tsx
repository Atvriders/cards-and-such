import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceStackMiniState, DiceStackMiniAction, DiceStackMiniSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceStackMiniGame({ state, dispatch, onGameOver }: GameProps<DiceStackMiniState, DiceStackMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS} • Stack {state.stackSize}</div>
      <div className="dm-score">{state.score} pts • Last: {state.lastDie || "—"}</div>
      {state.newDie !== null && (
        <div className="dm-row"><div className="dm-die">{state.newDie}</div></div>
      )}
      {state.phase === "rolling" && (
        <button className="dm-btn" onClick={() => dispatch({ type: "roll" } as DiceStackMiniAction)}>Roll</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="dm-result">{state.lastPts > 0 ? `Stacked! +${state.lastPts}` : "Broke stack — 0"}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type: "next" } as DiceStackMiniAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
