import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceTourDeFranceState, DiceTourDeFranceStateAction, DiceTourDeFranceSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, TARGET_POINTS } from "./state.js";
import "./Game.css";

export function DiceTourDeFranceGame({ state, dispatch, onGameOver }: GameProps<DiceTourDeFranceState, DiceTourDeFranceSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dice-tour-de-france-wrap"><div className="dice-tour-de-france-done"><h2>Done!</h2><div className="dice-tour-de-france-final">You {state.myPoints} - Opp {state.oppPoints}</div></div></div>;
  }
  return (
    <div className="dice-tour-de-france-wrap">
      <div className="dice-tour-de-france-info">Round {state.round} / {TOTAL_ROUNDS} - First to {TARGET_POINTS}</div>
      <div className="dice-tour-de-france-score">You {state.myPoints} - Opp {state.oppPoints}</div>
      {state.dice && (
        <div className="dice-tour-de-france-row">{state.dice.map((d, i) => <div key={i} className="dice-tour-de-france-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="dice-tour-de-france-btn" onClick={() => dispatch({ type:"roll" } as DiceTourDeFranceStateAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="dice-tour-de-france-result">{state.lastDelta > 0 ? "+" + state.lastDelta + " You" : state.lastDelta < 0 ? (-state.lastDelta) + " Opp" : "Rally"}</div>
          <button className="dice-tour-de-france-btn alt" onClick={() => dispatch({ type:"next" } as DiceTourDeFranceStateAction)}>Next</button>
        </>
      )}
    </div>
  );
}
