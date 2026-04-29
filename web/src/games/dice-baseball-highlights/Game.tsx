import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceBaseballHighlightsState, DiceBaseballHighlightsStateAction, DiceBaseballHighlightsSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, TARGET_POINTS } from "./state.js";
import "./Game.css";

export function DiceBaseballHighlightsGame({ state, dispatch, onGameOver }: GameProps<DiceBaseballHighlightsState, DiceBaseballHighlightsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dice-baseball-highlights-wrap"><div className="dice-baseball-highlights-done"><h2>Done!</h2><div className="dice-baseball-highlights-final">You {state.myPoints} - Opp {state.oppPoints}</div></div></div>;
  }
  return (
    <div className="dice-baseball-highlights-wrap">
      <div className="dice-baseball-highlights-info">Round {state.round} / {TOTAL_ROUNDS} - First to {TARGET_POINTS}</div>
      <div className="dice-baseball-highlights-score">You {state.myPoints} - Opp {state.oppPoints}</div>
      {state.dice && (
        <div className="dice-baseball-highlights-row">{state.dice.map((d, i) => <div key={i} className="dice-baseball-highlights-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="dice-baseball-highlights-btn" onClick={() => dispatch({ type:"roll" } as DiceBaseballHighlightsStateAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="dice-baseball-highlights-result">{state.lastDelta > 0 ? "+" + state.lastDelta + " You" : state.lastDelta < 0 ? (-state.lastDelta) + " Opp" : "Rally"}</div>
          <button className="dice-baseball-highlights-btn alt" onClick={() => dispatch({ type:"next" } as DiceBaseballHighlightsStateAction)}>Next</button>
        </>
      )}
    </div>
  );
}
