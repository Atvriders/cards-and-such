import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceArcheologyState, DiceArcheologyAction, DiceArcheologySettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceArcheologyGame({ state, dispatch, onGameOver }: GameProps<DiceArcheologyState, DiceArcheologySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dar-wrap"><div className="dar-done"><h2>Done!</h2><div className="dar-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dar-wrap">
      <div className="dar-info">Round {state.round + 1} / {TOTAL_ROUNDS}</div>
      <div className="dar-score">{state.score} pts</div>
      {state.lastRoll > 0 && (
        <>
          <div className="dar-die">{state.lastRoll}</div>
          <div className="dar-result">{state.lastPts > 0 ? `+${state.lastPts}` : "Miss"}</div>
        </>
      )}
      {state.rolls.length > 0 && (
        <div className="dar-row">
          {state.rolls.map((r, i) => <div key={i} className="dar-mini">{r}</div>)}
        </div>
      )}
      <button data-testid="hint-target-dice-archeology-roll" className="dar-btn" onClick={() => dispatch({ type:"roll" } as DiceArcheologyAction)}>Roll Die</button>
    </div>
  );
}
