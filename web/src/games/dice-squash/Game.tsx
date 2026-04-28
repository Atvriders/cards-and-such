import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceSquashState, DiceSquashAction, DiceSquashSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, TARGET_POINTS } from "./state.js";
import "./Game.css";

export function DiceSquashGame({ state, dispatch, onGameOver }: GameProps<DiceSquashState, DiceSquashSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-squash-wrap"><div className="ds-squash-done"><h2>Done!</h2><div className="ds-squash-final">You {state.myPoints} - Opp {state.oppPoints}</div></div></div>;
  }
  return (
    <div className="ds-squash-wrap">
      <div className="ds-squash-info">Round {state.round} / {TOTAL_ROUNDS} — First to {TARGET_POINTS}</div>
      <div className="ds-squash-score">You {state.myPoints} — Opp {state.oppPoints}</div>
      {state.dice && (
        <div className="ds-squash-row">{state.dice.map((d, i) => <div key={i} className="ds-squash-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-squash-btn" onClick={() => dispatch({ type:"roll" } as DiceSquashAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-squash-result">{state.lastDelta > 0 ? "+" + state.lastDelta + " You" : state.lastDelta < 0 ? (-state.lastDelta) + " Opp" : "Rally"}</div>
          <button className="ds-squash-btn alt" onClick={() => dispatch({ type:"next" } as DiceSquashAction)}>Next</button>
        </>
      )}
    </div>
  );
}
