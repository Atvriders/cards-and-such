import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceMirrorState, DiceMirrorAction, DiceMirrorSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceMirrorGame({ state, dispatch, onGameOver }: GameProps<DiceMirrorState, DiceMirrorSettings>): JSX.Element {
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
      {state.phase === "rolling" && (
        <button className="dm-btn" data-testid="hint-target-dice-mirror-roll" onClick={() => dispatch({ type:"roll" } as DiceMirrorAction)}>Roll</button>
      )}
      {state.phase === "result" && (
        <>
          <div className="dm-result">{state.lastPts > 0 ? `Mirror! +${state.lastPts}` : "No mirror — 0"}</div>
          <button className="dm-btn alt" data-testid="hint-target-dice-mirror-next" onClick={() => dispatch({ type:"next" } as DiceMirrorAction)}>Next</button>
        </>
      )}
    </div>
  );
}
