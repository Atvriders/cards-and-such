import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceTableTennisState, DiceTableTennisAction, DiceTableTennisSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, TARGET_POINTS } from "./state.js";
import "./Game.css";

export function DiceTableTennisGame({ state, dispatch, onGameOver }: GameProps<DiceTableTennisState, DiceTableTennisSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-table-ten-wrap"><div className="ds-table-ten-done"><h2>Done!</h2><div className="ds-table-ten-final">You {state.myPoints} - Opp {state.oppPoints}</div></div></div>;
  }
  return (
    <div className="ds-table-ten-wrap">
      <div className="ds-table-ten-info">Round {state.round} / {TOTAL_ROUNDS} — First to {TARGET_POINTS}</div>
      <div className="ds-table-ten-score">You {state.myPoints} — Opp {state.oppPoints}</div>
      {state.dice && (
        <div className="ds-table-ten-row">{state.dice.map((d, i) => <div key={i} className="ds-table-ten-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-table-ten-btn" onClick={() => dispatch({ type:"roll" } as DiceTableTennisAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-table-ten-result">{state.lastDelta > 0 ? "+" + state.lastDelta + " You" : state.lastDelta < 0 ? (-state.lastDelta) + " Opp" : "Rally"}</div>
          <button className="ds-table-ten-btn alt" onClick={() => dispatch({ type:"next" } as DiceTableTennisAction)}>Next</button>
        </>
      )}
    </div>
  );
}
