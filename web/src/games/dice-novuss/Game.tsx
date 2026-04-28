import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceNovussState, DiceNovussAction, DiceNovussSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceNovussGame({ state, dispatch, onGameOver }: GameProps<DiceNovussState, DiceNovussSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-novuss-wrap"><div className="ds-novuss-done"><h2>Done!</h2><div className="ds-novuss-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ds-novuss-wrap">
      <div className="ds-novuss-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ds-novuss-score">{state.score} pts</div>
      {state.dice && (
        <div className="ds-novuss-row">{state.dice.map((d, i) => <div key={i} className="ds-novuss-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-novuss-btn" onClick={() => dispatch({ type:"roll" } as DiceNovussAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-novuss-result">+{state.lastPts}</div>
          <button className="ds-novuss-btn alt" onClick={() => dispatch({ type:"next" } as DiceNovussAction)}>Next</button>
        </>
      )}
    </div>
  );
}
