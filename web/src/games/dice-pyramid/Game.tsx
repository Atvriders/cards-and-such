import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DicePyramidState, DicePyramidAction, DicePyramidSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DicePyramidGame({ state, dispatch, onGameOver }: GameProps<DicePyramidState, DicePyramidSettings>): JSX.Element {
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
        <>
          <div className="dm-row">
            {state.dice.slice(0, 1).map((d, i) => <div key={i} className="dm-die">{d}</div>)}
          </div>
          <div className="dm-row">
            {state.dice.slice(1, 3).map((d, i) => <div key={i} className="dm-die">{d}</div>)}
          </div>
          <div className="dm-row">
            {state.dice.slice(3, 6).map((d, i) => <div key={i} className="dm-die">{d}</div>)}
          </div>
        </>
      )}
      {state.phase === "rolling" && (
        <button data-testid="hint-target-dice-pyramid-roll" className="dm-btn" onClick={() => dispatch({ type: "roll" } as DicePyramidAction)}>Roll Pyramid</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="dm-result">Sum {state.sum} • Ones: {state.ones} → +{state.lastPts}</div>
          <button data-testid="hint-target-dice-pyramid-next" className="dm-btn alt" onClick={() => dispatch({ type: "next" } as DicePyramidAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
