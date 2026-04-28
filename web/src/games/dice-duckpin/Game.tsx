import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceDuckpinState, DiceDuckpinAction, DiceDuckpinSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceDuckpinGame({ state, dispatch, onGameOver }: GameProps<DiceDuckpinState, DiceDuckpinSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-duckpin-wrap"><div className="ds-duckpin-done"><h2>Done!</h2><div className="ds-duckpin-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ds-duckpin-wrap">
      <div className="ds-duckpin-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ds-duckpin-score">{state.score} pts</div>
      {state.dice && (
        <div className="ds-duckpin-row">{state.dice.map((d, i) => <div key={i} className="ds-duckpin-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-duckpin-btn" onClick={() => dispatch({ type:"roll" } as DiceDuckpinAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-duckpin-result">+{state.lastPts}</div>
          <button className="ds-duckpin-btn alt" onClick={() => dispatch({ type:"next" } as DiceDuckpinAction)}>Next</button>
        </>
      )}
    </div>
  );
}
