import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceGridState, DiceGridAction, DiceGridSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceGridGame({ state, dispatch, onGameOver }: GameProps<DiceGridState, DiceGridSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dx-wrap"><div className="dx-done"><h2>Done!</h2><div className="dx-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dx-wrap">
      <div className="dx-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dx-score">{state.score} pts</div>
      {state.dice && (
        <div className="dx-row">{state.dice.map((d, i) => <div key={i} className="dx-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="dx-btn" onClick={() => dispatch({ type:"roll" } as DiceGridAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="dx-result">+{state.lastPts}</div>
          <button className="dx-btn alt" onClick={() => dispatch({ type:"next" } as DiceGridAction)}>Next</button>
        </>
      )}
    </div>
  );
}
