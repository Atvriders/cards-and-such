import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceBakeState, DiceBakeAction, DiceBakeSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function DiceBakeGame({ state, dispatch, onGameOver }: GameProps<DiceBakeState, DiceBakeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><div className="dm-done bounce-in"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap fade-in">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-info">Beat: {state.prevSum}</div>
      <div className="dm-score pulse">{state.score} pts</div>
      {state.dice.length > 0 && <div className="dm-row">{state.dice.map((d,i)=><div key={i} className="dm-die">{d}</div>)}</div>}
      {state.phase === "rolling" && <button className="dm-btn" data-testid="hint-target-dice-bake-roll" onClick={() => dispatch({ type:"roll" } as DiceBakeAction)}>Bake!</button>}
      {state.phase === "scored" && (<><div className="dm-result">Sum: {state.sum} {state.lastPts>0?`(+${state.lastPts})`:"(no rise)"}</div><button className="dm-btn alt" data-testid="hint-target-dice-bake-next" onClick={() => dispatch({ type:"next" } as DiceBakeAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button></>)}
    </div>
  );
}
