import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PursuePennantState, PursuePennantAction, PursuePennantSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function PursuePennantGame({ state, dispatch, onGameOver }: GameProps<PursuePennantState, PursuePennantSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-purspenn-wrap"><div className="g-purspenn-done"><h2>Match!</h2><div className="g-purspenn-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="g-purspenn-wrap">
      <div className="g-purspenn-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="g-purspenn-score">{state.score} pts</div>
      {state.dice && (
        <div className="g-purspenn-row">{state.dice.map((d, i) => <div key={i} className="g-purspenn-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="g-purspenn-btn" onClick={() => dispatch({ type:"roll" } as PursuePennantAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="g-purspenn-result">+{state.lastPts}</div>
          <button className="g-purspenn-btn alt" onClick={() => dispatch({ type:"next" } as PursuePennantAction)}>Next</button>
        </>
      )}
    </div>
  );
}
