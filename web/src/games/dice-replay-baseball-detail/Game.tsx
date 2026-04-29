import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceReplayBaseballDetailState, DiceReplayBaseballDetailStateAction, DiceReplayBaseballDetailSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, TARGET_POINTS } from "./state.js";
import "./Game.css";

export function DiceReplayBaseballDetailGame({ state, dispatch, onGameOver }: GameProps<DiceReplayBaseballDetailState, DiceReplayBaseballDetailSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dice-replay-baseball-detail-wrap"><div className="dice-replay-baseball-detail-done"><h2>Done!</h2><div className="dice-replay-baseball-detail-final">You {state.myPoints} - Opp {state.oppPoints}</div></div></div>;
  }
  return (
    <div className="dice-replay-baseball-detail-wrap">
      <div className="dice-replay-baseball-detail-info">Round {state.round} / {TOTAL_ROUNDS} - First to {TARGET_POINTS}</div>
      <div className="dice-replay-baseball-detail-score">You {state.myPoints} - Opp {state.oppPoints}</div>
      {state.dice && (
        <div className="dice-replay-baseball-detail-row">{state.dice.map((d, i) => <div key={i} className="dice-replay-baseball-detail-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="dice-replay-baseball-detail-btn" onClick={() => dispatch({ type:"roll" } as DiceReplayBaseballDetailStateAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="dice-replay-baseball-detail-result">{state.lastDelta > 0 ? "+" + state.lastDelta + " You" : state.lastDelta < 0 ? (-state.lastDelta) + " Opp" : "Rally"}</div>
          <button className="dice-replay-baseball-detail-btn alt" onClick={() => dispatch({ type:"next" } as DiceReplayBaseballDetailStateAction)}>Next</button>
        </>
      )}
    </div>
  );
}
