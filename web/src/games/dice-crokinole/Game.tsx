import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceCrokinoleState, DiceCrokinoleAction, DiceCrokinoleSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceCrokinoleGame({ state, dispatch, onGameOver }: GameProps<DiceCrokinoleState, DiceCrokinoleSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-crokinole-wrap"><div className="ds-crokinole-done"><h2>Done!</h2><div className="ds-crokinole-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ds-crokinole-wrap">
      <div className="ds-crokinole-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ds-crokinole-score">{state.score} pts</div>
      {state.dice && (
        <div className="ds-crokinole-row">{state.dice.map((d, i) => <div key={i} className="ds-crokinole-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-crokinole-btn" onClick={() => dispatch({ type:"roll" } as DiceCrokinoleAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-crokinole-result">+{state.lastPts}</div>
          <button className="ds-crokinole-btn alt" onClick={() => dispatch({ type:"next" } as DiceCrokinoleAction)}>Next</button>
        </>
      )}
    </div>
  );
}
