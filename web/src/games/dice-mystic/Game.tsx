import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceMysticState, DiceMysticAction, DiceMysticSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function DiceMysticGame({ state, dispatch, onGameOver }: GameProps<DiceMysticState, DiceMysticSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.dice && (<div className="dm-row"><div className="dm-die">{state.dice[0]}</div><div className="dm-die">{state.dice[1]}</div></div>)}
      {state.phase === "choose" && (<div className="dm-row"><button className="dm-btn" onClick={() => dispatch({ type:"choose", mult:1 } as DiceMysticAction)}>x1 (always sum)</button><button className="dm-btn alt" onClick={() => dispatch({ type:"choose", mult:2 } as DiceMysticAction)}>x2 (if even)</button><button className="dm-btn alt" onClick={() => dispatch({ type:"choose", mult:3 } as DiceMysticAction)}>x3 (if pair)</button></div>)}
      {state.phase === "result" && (<><div className="dm-result">+{state.lastPts}</div><button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as DiceMysticAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button></>)}
    </div>
  );
}
