import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceBadmintonState, DiceBadmintonAction, DiceBadmintonSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, TARGET_POINTS } from "./state.js";
import "./Game.css";

export function DiceBadmintonGame({ state, dispatch, onGameOver }: GameProps<DiceBadmintonState, DiceBadmintonSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-badminton-wrap"><div className="ds-badminton-done"><h2>Done!</h2><div className="ds-badminton-final">You {state.myPoints} - Opp {state.oppPoints}</div></div></div>;
  }
  return (
    <div className="ds-badminton-wrap">
      <div className="ds-badminton-info">Round {state.round} / {TOTAL_ROUNDS} — First to {TARGET_POINTS}</div>
      <div className="ds-badminton-score">You {state.myPoints} — Opp {state.oppPoints}</div>
      {state.dice && (
        <div className="ds-badminton-row">{state.dice.map((d, i) => <div key={i} className="ds-badminton-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-badminton-btn" onClick={() => dispatch({ type:"roll" } as DiceBadmintonAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-badminton-result">{state.lastDelta > 0 ? "+" + state.lastDelta + " You" : state.lastDelta < 0 ? (-state.lastDelta) + " Opp" : "Rally"}</div>
          <button className="ds-badminton-btn alt" onClick={() => dispatch({ type:"next" } as DiceBadmintonAction)}>Next</button>
        </>
      )}
    </div>
  );
}
