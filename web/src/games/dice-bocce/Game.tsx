import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceBocceState, DiceBocceAction, DiceBocceSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceBocceGame({ state, dispatch, onGameOver }: GameProps<DiceBocceState, DiceBocceSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-bocce-wrap"><div className="ds-bocce-done"><h2>Done!</h2><div className="ds-bocce-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ds-bocce-wrap">
      <div className="ds-bocce-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ds-bocce-score">{state.score} pts</div>
      {state.dice && (
        <div className="ds-bocce-row">{state.dice.map((d, i) => <div key={i} className="ds-bocce-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-bocce-btn" onClick={() => dispatch({ type:"roll" } as DiceBocceAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-bocce-result">+{state.lastPts}</div>
          <button className="ds-bocce-btn alt" onClick={() => dispatch({ type:"next" } as DiceBocceAction)}>Next</button>
        </>
      )}
    </div>
  );
}
