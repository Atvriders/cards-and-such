import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceKubbState, DiceKubbAction, DiceKubbSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceKubbGame({ state, dispatch, onGameOver }: GameProps<DiceKubbState, DiceKubbSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-kubb-wrap"><div className="ds-kubb-done"><h2>Done!</h2><div className="ds-kubb-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ds-kubb-wrap">
      <div className="ds-kubb-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ds-kubb-score">{state.score} pts</div>
      {state.dice && (
        <div className="ds-kubb-row">{state.dice.map((d, i) => <div key={i} className="ds-kubb-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-kubb-btn" onClick={() => dispatch({ type:"roll" } as DiceKubbAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-kubb-result">+{state.lastPts}</div>
          <button className="ds-kubb-btn alt" onClick={() => dispatch({ type:"next" } as DiceKubbAction)}>Next</button>
        </>
      )}
    </div>
  );
}
