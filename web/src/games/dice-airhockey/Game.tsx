import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceAirhockeyState, DiceAirhockeyAction, DiceAirhockeySettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, TARGET_POINTS } from "./state.js";
import "./Game.css";

export function DiceAirhockeyGame({ state, dispatch, onGameOver }: GameProps<DiceAirhockeyState, DiceAirhockeySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-airhockey-wrap"><div className="ds-airhockey-done"><h2>Done!</h2><div className="ds-airhockey-final">You {state.myPoints} - Opp {state.oppPoints}</div></div></div>;
  }
  return (
    <div className="ds-airhockey-wrap">
      <div className="ds-airhockey-info">Round {state.round} / {TOTAL_ROUNDS} — First to {TARGET_POINTS}</div>
      <div className="ds-airhockey-score">You {state.myPoints} — Opp {state.oppPoints}</div>
      {state.dice && (
        <div className="ds-airhockey-row">{state.dice.map((d, i) => <div key={i} className="ds-airhockey-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-airhockey-btn" onClick={() => dispatch({ type:"roll" } as DiceAirhockeyAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-airhockey-result">{state.lastDelta > 0 ? "+" + state.lastDelta + " You" : state.lastDelta < 0 ? (-state.lastDelta) + " Opp" : "Rally"}</div>
          <button className="ds-airhockey-btn alt" onClick={() => dispatch({ type:"next" } as DiceAirhockeyAction)}>Next</button>
        </>
      )}
    </div>
  );
}
