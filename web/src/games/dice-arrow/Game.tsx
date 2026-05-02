import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceArrowState, DiceArrowAction, DiceArrowSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, TARGET_FACE } from "./state.js";
import "./Game.css";

export function DiceArrowGame({ state, dispatch, onGameOver }: GameProps<DiceArrowState, DiceArrowSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS} • Hunt for {TARGET_FACE}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.rolls.length > 0 && (
        <div className="dm-row">
          {state.rolls.slice(-12).map((d, i) => <div key={i} className="dm-die" style={{ background: d === TARGET_FACE ? "#fef9e7" : "#fff" }}>{d}</div>)}
        </div>
      )}
      {state.phase === "ready" && (
        <button className="dm-btn" data-testid="hint-target-dice-arrow-roll" onClick={() => dispatch({ type: "shoot" } as DiceArrowAction)}>Shoot Arrow</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="dm-result">Hit {TARGET_FACE} after {state.rolls.length} rolls → +{state.lastPts}</div>
          <button className="dm-btn alt" data-testid="hint-target-dice-arrow-next" onClick={() => dispatch({ type: "next" } as DiceArrowAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
