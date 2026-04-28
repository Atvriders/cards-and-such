import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceTenpinBowlState, DiceTenpinBowlAction, DiceTenpinBowlSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceTenpinBowlGame({ state, dispatch, onGameOver }: GameProps<DiceTenpinBowlState, DiceTenpinBowlSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-tenpin-bo-wrap"><div className="ds-tenpin-bo-done"><h2>Done!</h2><div className="ds-tenpin-bo-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ds-tenpin-bo-wrap">
      <div className="ds-tenpin-bo-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ds-tenpin-bo-score">{state.score} pts</div>
      {state.dice && (
        <div className="ds-tenpin-bo-row">{state.dice.map((d, i) => <div key={i} className="ds-tenpin-bo-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-tenpin-bo-btn" onClick={() => dispatch({ type:"roll" } as DiceTenpinBowlAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-tenpin-bo-result">+{state.lastPts}</div>
          <button className="ds-tenpin-bo-btn alt" onClick={() => dispatch({ type:"next" } as DiceTenpinBowlAction)}>Next</button>
        </>
      )}
    </div>
  );
}
