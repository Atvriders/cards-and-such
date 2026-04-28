import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceFoosballState, DiceFoosballAction, DiceFoosballSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, TARGET_POINTS } from "./state.js";
import "./Game.css";

export function DiceFoosballGame({ state, dispatch, onGameOver }: GameProps<DiceFoosballState, DiceFoosballSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-foosball-wrap"><div className="ds-foosball-done"><h2>Done!</h2><div className="ds-foosball-final">You {state.myPoints} - Opp {state.oppPoints}</div></div></div>;
  }
  return (
    <div className="ds-foosball-wrap">
      <div className="ds-foosball-info">Round {state.round} / {TOTAL_ROUNDS} — First to {TARGET_POINTS}</div>
      <div className="ds-foosball-score">You {state.myPoints} — Opp {state.oppPoints}</div>
      {state.dice && (
        <div className="ds-foosball-row">{state.dice.map((d, i) => <div key={i} className="ds-foosball-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-foosball-btn" onClick={() => dispatch({ type:"roll" } as DiceFoosballAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-foosball-result">{state.lastDelta > 0 ? "+" + state.lastDelta + " You" : state.lastDelta < 0 ? (-state.lastDelta) + " Opp" : "Rally"}</div>
          <button className="ds-foosball-btn alt" onClick={() => dispatch({ type:"next" } as DiceFoosballAction)}>Next</button>
        </>
      )}
    </div>
  );
}
