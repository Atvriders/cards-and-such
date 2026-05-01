import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceBowlingState, DiceBowlingAction, DiceBowlingSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceBowlingGame({ state, dispatch, onGameOver }: GameProps<DiceBowlingState, DiceBowlingSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dbwl-wrap dbwl-theme"><div className="dbwl-done"><h2>Done!</h2><div className="dbwl-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dbwl-wrap dbwl-theme">
      <div className="dbwl-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dbwl-score">{state.score} pts</div>
      {state.dice && (
        <div className="dbwl-row">{state.dice.map((d, i) => <div key={i} className="dbwl-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="dbwl-btn" onClick={() => dispatch({ type:"roll" } as DiceBowlingAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="dbwl-result">+{state.lastPts}</div>
          <button className="dbwl-btn alt" onClick={() => dispatch({ type:"next" } as DiceBowlingAction)}>Next</button>
        </>
      )}
    </div>
  );
}
