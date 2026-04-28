import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DicePirateState, DicePirateAction, DicePirateSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function DicePirateGame({ state, dispatch, onGameOver }: GameProps<DicePirateState, DicePirateSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.dice && (
        <div className="dm-row">
          <div className="dm-die">{state.dice[0]}</div>
          <div className="dm-die">{state.dice[1]}</div>
        </div>
      )}
      {state.phase === "roll" && (
        <button className="dm-btn" onClick={() => dispatch({ type:"roll" } as DicePirateAction)}>Roll</button>
      )}
      {state.phase === "result" && (
        <>
          <div className="dm-result">{state.lastWin ? `Hit! +${state.lastPts}` : "Miss — 0"}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as DicePirateAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
