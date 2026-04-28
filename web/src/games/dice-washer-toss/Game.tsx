import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceWasherTossState, DiceWasherTossAction, DiceWasherTossSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceWasherTossGame({ state, dispatch, onGameOver }: GameProps<DiceWasherTossState, DiceWasherTossSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-washer-to-wrap"><div className="ds-washer-to-done"><h2>Done!</h2><div className="ds-washer-to-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ds-washer-to-wrap">
      <div className="ds-washer-to-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ds-washer-to-score">{state.score} pts</div>
      {state.dice && (
        <div className="ds-washer-to-row">{state.dice.map((d, i) => <div key={i} className="ds-washer-to-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-washer-to-btn" onClick={() => dispatch({ type:"roll" } as DiceWasherTossAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-washer-to-result">+{state.lastPts}</div>
          <button className="ds-washer-to-btn alt" onClick={() => dispatch({ type:"next" } as DiceWasherTossAction)}>Next</button>
        </>
      )}
    </div>
  );
}
