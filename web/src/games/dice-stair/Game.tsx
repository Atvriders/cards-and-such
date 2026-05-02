import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceStairState, DiceStairAction, DiceStairSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceStairGame({ state, dispatch, onGameOver }: GameProps<DiceStairState, DiceStairSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  const sorted = [...state.dice].sort((a,b)=>a-b);
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {sorted.length > 0 && (
        <div className="dm-row">
          {sorted.map((d, i) => <div key={i} className="dm-die">{d}</div>)}
        </div>
      )}
      {state.phase === "rolling" && (
        <button className="dm-btn" data-testid="hint-target-dice-stair-roll" onClick={() => dispatch({ type:"roll" } as DiceStairAction)}>Roll</button>
      )}
      {state.phase === "result" && (
        <>
          <div className="dm-result">{state.lastPts > 0 ? `Stair! +${state.lastPts}` : "No stair — 0"}</div>
          <button className="dm-btn alt" data-testid="hint-target-dice-stair-next" onClick={() => dispatch({ type:"next" } as DiceStairAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
