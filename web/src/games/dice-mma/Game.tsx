import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceMmaState, DiceMmaAction, DiceMmaSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceMmaGame({ state, dispatch, onGameOver }: GameProps<DiceMmaState, DiceMmaSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-dicemma-wrap"><div className="g-dicemma-done"><h2>Match!</h2><div className="g-dicemma-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="g-dicemma-wrap">
      <div className="g-dicemma-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="g-dicemma-score">{state.score} pts</div>
      {state.dice && (
        <div className="g-dicemma-row">{state.dice.map((d, i) => <div key={i} className="g-dicemma-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="g-dicemma-btn" onClick={() => dispatch({ type:"roll" } as DiceMmaAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="g-dicemma-result">+{state.lastPts}</div>
          <button className="g-dicemma-btn alt" onClick={() => dispatch({ type:"next" } as DiceMmaAction)}>Next</button>
        </>
      )}
    </div>
  );
}
