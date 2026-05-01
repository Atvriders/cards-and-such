import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceTargetState, DiceTargetAction, DiceTargetSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, TARGET } from "./state.js";
import "./Game.css";

export function DiceTargetGame({ state, dispatch, onGameOver }: GameProps<DiceTargetState, DiceTargetSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap dice-target-theme"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap dice-target-theme">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS} • Target {TARGET}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.dice && (
        <div className="dm-row">
          {state.dice.map((d, i) => <div key={i} className="dm-die">{d}</div>)}
        </div>
      )}
      {state.phase === "rolling" && (
        <button className="dm-btn" onClick={() => dispatch({ type: "roll" } as DiceTargetAction)}>Roll 3 Dice</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="dm-result">Sum: {state.sum} — {state.lastPts > 0 ? `+${state.lastPts}` : "0 pts"}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type: "next" } as DiceTargetAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
