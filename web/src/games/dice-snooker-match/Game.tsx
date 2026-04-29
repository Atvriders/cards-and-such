import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceSnookerMatchState, DiceSnookerMatchStateAction, DiceSnookerMatchSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, TARGET_POINTS } from "./state.js";
import "./Game.css";

export function DiceSnookerMatchGame({ state, dispatch, onGameOver }: GameProps<DiceSnookerMatchState, DiceSnookerMatchSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dice-snooker-match-wrap"><div className="dice-snooker-match-done"><h2>Done!</h2><div className="dice-snooker-match-final">You {state.myPoints} - Opp {state.oppPoints}</div></div></div>;
  }
  return (
    <div className="dice-snooker-match-wrap">
      <div className="dice-snooker-match-info">Round {state.round} / {TOTAL_ROUNDS} - First to {TARGET_POINTS}</div>
      <div className="dice-snooker-match-score">You {state.myPoints} - Opp {state.oppPoints}</div>
      {state.dice && (
        <div className="dice-snooker-match-row">{state.dice.map((d, i) => <div key={i} className="dice-snooker-match-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="dice-snooker-match-btn" onClick={() => dispatch({ type:"roll" } as DiceSnookerMatchStateAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="dice-snooker-match-result">{state.lastDelta > 0 ? "+" + state.lastDelta + " You" : state.lastDelta < 0 ? (-state.lastDelta) + " Opp" : "Rally"}</div>
          <button className="dice-snooker-match-btn alt" onClick={() => dispatch({ type:"next" } as DiceSnookerMatchStateAction)}>Next</button>
        </>
      )}
    </div>
  );
}
