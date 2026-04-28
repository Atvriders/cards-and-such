import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DungeonFighterThrowState, DungeonFighterThrowAction, DungeonFighterThrowSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function DungeonFighterThrowGame({ state, dispatch, onGameOver }: GameProps<DungeonFighterThrowState, DungeonFighterThrowSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done"><h2>🎯 Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  const sum = state.rolls.reduce((a,b)=>a+b,0);
  return (
    <div className="dm-wrap">
      <div className="dm-info">🎯 Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      <div className="dm-rule">Target: {state.target}</div>
      {state.rolls.length > 0 && (
        <>
          <div className="dm-row">{state.rolls.map((r, k) => <div key={k} className="dm-die">{r}</div>)}</div>
          <div className="dm-rule">Sum: {sum}</div>
        </>
      )}
      {state.phase === "rolling" && (
        <button className="dm-btn" onClick={() => dispatch({ type:"roll" } as DungeonFighterThrowAction)}>Roll</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="dm-result">+{state.lastPts} pts</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as DungeonFighterThrowAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
