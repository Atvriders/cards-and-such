import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceBowlState, DiceBowlAction, DiceBowlSettings } from "./state.js";
import { isTerminal, TOTAL_FRAMES } from "./state.js";
import "./Game.css";

export function DiceBowlGame({ state, dispatch, onGameOver }: GameProps<DiceBowlState, DiceBowlSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap">
      <div className="dm-info">Frame {state.frame} / {TOTAL_FRAMES}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.dice.length > 0 && (
        <div className="dm-row">
          {state.dice.map((d, i) => <div key={i} className={`dm-die${d >= 4 ? " knocked" : ""}`}>{d}</div>)}
        </div>
      )}
      {state.phase === "rolling" && (
        <button className="dm-btn" onClick={() => dispatch({ type:"roll" } as DiceBowlAction)}>Bowl 10</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="dm-result">{state.strike ? `STRIKE! ${state.knocked} pins +10 = ${state.pts}` : `${state.knocked} pins → +${state.pts}`}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as DiceBowlAction)}>{state.frame >= TOTAL_FRAMES ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
