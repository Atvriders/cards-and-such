import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceAroundClockState, DiceAroundClockAction, DiceAroundClockSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, TARGET_MAX } from "./state.js";
import "./Game.css";

export function DiceAroundClockGame({ state, dispatch, onGameOver }: GameProps<DiceAroundClockState, DiceAroundClockSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-around-cl-wrap"><div className="ds-around-cl-done"><h2>Done!</h2><div className="ds-around-cl-final">Cleared {Math.min(TARGET_MAX, state.target)} / {TARGET_MAX}</div></div></div>;
  }
  return (
    <div className="ds-around-cl-wrap">
      <div className="ds-around-cl-info">Round {state.round} / {TOTAL_ROUNDS} — Target: {state.target}</div>
      {state.dice && (
        <div className="ds-around-cl-row">{state.dice.map((d, i) => <div key={i} className="ds-around-cl-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-around-cl-btn" onClick={() => dispatch({ type:"roll" } as DiceAroundClockAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-around-cl-result">{state.advanced ? "Hit! Advance" : "Miss — try again"}</div>
          <button className="ds-around-cl-btn alt" onClick={() => dispatch({ type:"next" } as DiceAroundClockAction)}>Next</button>
        </>
      )}
    </div>
  );
}
