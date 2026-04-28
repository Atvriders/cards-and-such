import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceBocciaState, DiceBocciaAction, DiceBocciaSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceBocciaGame({ state, dispatch, onGameOver }: GameProps<DiceBocciaState, DiceBocciaSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-boccia-wrap"><div className="ds-boccia-done"><h2>Done!</h2><div className="ds-boccia-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ds-boccia-wrap">
      <div className="ds-boccia-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ds-boccia-score">{state.score} pts</div>
      {state.dice && (
        <div className="ds-boccia-row">{state.dice.map((d, i) => <div key={i} className="ds-boccia-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-boccia-btn" onClick={() => dispatch({ type:"roll" } as DiceBocciaAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-boccia-result">+{state.lastPts}</div>
          <button className="ds-boccia-btn alt" onClick={() => dispatch({ type:"next" } as DiceBocciaAction)}>Next</button>
        </>
      )}
    </div>
  );
}
