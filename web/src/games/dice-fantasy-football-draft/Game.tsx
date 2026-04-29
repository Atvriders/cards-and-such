import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceFantasyFootballDraftState, DiceFantasyFootballDraftStateAction, DiceFantasyFootballDraftSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, TARGET_POINTS } from "./state.js";
import "./Game.css";

export function DiceFantasyFootballDraftGame({ state, dispatch, onGameOver }: GameProps<DiceFantasyFootballDraftState, DiceFantasyFootballDraftSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dice-fantasy-football-draft-wrap"><div className="dice-fantasy-football-draft-done"><h2>Done!</h2><div className="dice-fantasy-football-draft-final">You {state.myPoints} - Opp {state.oppPoints}</div></div></div>;
  }
  return (
    <div className="dice-fantasy-football-draft-wrap">
      <div className="dice-fantasy-football-draft-info">Round {state.round} / {TOTAL_ROUNDS} - First to {TARGET_POINTS}</div>
      <div className="dice-fantasy-football-draft-score">You {state.myPoints} - Opp {state.oppPoints}</div>
      {state.dice && (
        <div className="dice-fantasy-football-draft-row">{state.dice.map((d, i) => <div key={i} className="dice-fantasy-football-draft-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="dice-fantasy-football-draft-btn" onClick={() => dispatch({ type:"roll" } as DiceFantasyFootballDraftStateAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="dice-fantasy-football-draft-result">{state.lastDelta > 0 ? "+" + state.lastDelta + " You" : state.lastDelta < 0 ? (-state.lastDelta) + " Opp" : "Rally"}</div>
          <button className="dice-fantasy-football-draft-btn alt" onClick={() => dispatch({ type:"next" } as DiceFantasyFootballDraftStateAction)}>Next</button>
        </>
      )}
    </div>
  );
}
