import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceEisstockState, DiceEisstockAction, DiceEisstockSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceEisstockGame({ state, dispatch, onGameOver }: GameProps<DiceEisstockState, DiceEisstockSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-eisstock-wrap"><div className="ds-eisstock-done"><h2>Done!</h2><div className="ds-eisstock-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ds-eisstock-wrap">
      <div className="ds-eisstock-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ds-eisstock-score">{state.score} pts</div>
      {state.dice && (
        <div className="ds-eisstock-row">{state.dice.map((d, i) => <div key={i} className="ds-eisstock-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-eisstock-btn" onClick={() => dispatch({ type:"roll" } as DiceEisstockAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-eisstock-result">+{state.lastPts}</div>
          <button className="ds-eisstock-btn alt" onClick={() => dispatch({ type:"next" } as DiceEisstockAction)}>Next</button>
        </>
      )}
    </div>
  );
}
