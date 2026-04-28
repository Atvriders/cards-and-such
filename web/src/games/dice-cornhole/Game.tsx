import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceCornholeState, DiceCornholeAction, DiceCornholeSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceCornholeGame({ state, dispatch, onGameOver }: GameProps<DiceCornholeState, DiceCornholeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-cornhole-wrap"><div className="ds-cornhole-done"><h2>Done!</h2><div className="ds-cornhole-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ds-cornhole-wrap">
      <div className="ds-cornhole-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ds-cornhole-score">{state.score} pts</div>
      {state.dice && (
        <div className="ds-cornhole-row">{state.dice.map((d, i) => <div key={i} className="ds-cornhole-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-cornhole-btn" onClick={() => dispatch({ type:"roll" } as DiceCornholeAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-cornhole-result">+{state.lastPts}</div>
          <button className="ds-cornhole-btn alt" onClick={() => dispatch({ type:"next" } as DiceCornholeAction)}>Next</button>
        </>
      )}
    </div>
  );
}
