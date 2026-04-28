import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceFivePinState, DiceFivePinAction, DiceFivePinSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceFivePinGame({ state, dispatch, onGameOver }: GameProps<DiceFivePinState, DiceFivePinSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-five-pin-wrap"><div className="ds-five-pin-done"><h2>Done!</h2><div className="ds-five-pin-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ds-five-pin-wrap">
      <div className="ds-five-pin-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ds-five-pin-score">{state.score} pts</div>
      {state.dice && (
        <div className="ds-five-pin-row">{state.dice.map((d, i) => <div key={i} className="ds-five-pin-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-five-pin-btn" onClick={() => dispatch({ type:"roll" } as DiceFivePinAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-five-pin-result">+{state.lastPts}</div>
          <button className="ds-five-pin-btn alt" onClick={() => dispatch({ type:"next" } as DiceFivePinAction)}>Next</button>
        </>
      )}
    </div>
  );
}
