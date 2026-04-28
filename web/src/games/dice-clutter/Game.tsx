import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceClutterState, DiceClutterAction, DiceClutterSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function DiceClutterGame({ state, dispatch, onGameOver }: GameProps<DiceClutterState, DiceClutterSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.dice.length > 0 && <div className="dm-row">{state.dice.map((d,i)=><div key={i} className="dm-die">{d}</div>)}</div>}
      {state.phase === "rolling" && <button className="dm-btn" onClick={() => dispatch({ type:"roll" } as DiceClutterAction)}>Roll 8</button>}
      {state.phase === "scored" && (<><div className="dm-result">Best 3 sum: {state.bestSum} (+{state.lastPts})</div><button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as DiceClutterAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button></>)}
    </div>
  );
}
