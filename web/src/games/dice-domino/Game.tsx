import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceDominoState, DiceDominoAction, DiceDominoSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function DiceDominoGame({ state, dispatch, onGameOver }: GameProps<DiceDominoState, DiceDominoSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      <div className="dm-info">Target domino:</div>
      <div className="dm-row">
        <div className="dm-die">{state.target[0]}</div>
        <div className="dm-die">{state.target[1]}</div>
      </div>
      {state.rolled && (
        <>
          <div className="dm-info">Your roll:</div>
          <div className="dm-row">
            <div className="dm-die">{state.rolled[0]}</div>
            <div className="dm-die">{state.rolled[1]}</div>
          </div>
        </>
      )}
      {state.phase === "ready" && (
        <button className="dm-btn" onClick={() => dispatch({ type:"roll" } as DiceDominoAction)}>Roll 2 Dice</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="dm-result">{state.lastBonus === 20 ? "Perfect match! +20" : state.lastBonus === 5 ? "Half match! +5" : "No match"}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as DiceDominoAction)}>Next</button>
        </>
      )}
    </div>
  );
}
