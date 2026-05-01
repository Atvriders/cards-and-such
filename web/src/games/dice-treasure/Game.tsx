import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceTreasureState, DiceTreasureAction, DiceTreasureSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function DiceTreasureGame({ state, dispatch, onGameOver }: GameProps<DiceTreasureState, DiceTreasureSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap dice-treasure-theme"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap dice-treasure-theme">
      <div className="dm-info">Treasure — Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.dice && (
        <div className="dm-row">
          <div className="dm-die">{state.dice[0]}</div>
          <div className="dm-die">{state.dice[1]}</div>
        </div>
      )}
      {state.phase === "roll" && (
        <button className="dm-btn" onClick={() => dispatch({ type:"roll" } as DiceTreasureAction)}>Roll</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="dm-result">{state.lastPts > 0 ? `+${state.lastPts}` : "No points"}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as DiceTreasureAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
