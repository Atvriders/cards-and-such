import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceVolleyballState, DiceVolleyballAction, DiceVolleyballSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, TARGET_POINTS } from "./state.js";
import "./Game.css";

export function DiceVolleyballGame({ state, dispatch, onGameOver }: GameProps<DiceVolleyballState, DiceVolleyballSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-volleybal-wrap"><div className="ds-volleybal-done"><h2>Done!</h2><div className="ds-volleybal-final">You {state.myPoints} - Opp {state.oppPoints}</div></div></div>;
  }
  return (
    <div className="ds-volleybal-wrap">
      <div className="ds-volleybal-info">Round {state.round} / {TOTAL_ROUNDS} — First to {TARGET_POINTS}</div>
      <div className="ds-volleybal-score">You {state.myPoints} — Opp {state.oppPoints}</div>
      {state.dice && (
        <div className="ds-volleybal-row">{state.dice.map((d, i) => <div key={i} className="ds-volleybal-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-volleybal-btn" onClick={() => dispatch({ type:"roll" } as DiceVolleyballAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-volleybal-result">{state.lastDelta > 0 ? "+" + state.lastDelta + " You" : state.lastDelta < 0 ? (-state.lastDelta) + " Opp" : "Rally"}</div>
          <button className="ds-volleybal-btn alt" onClick={() => dispatch({ type:"next" } as DiceVolleyballAction)}>Next</button>
        </>
      )}
    </div>
  );
}
