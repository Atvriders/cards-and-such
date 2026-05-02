import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceSpinState, DiceSpinAction, DiceSpinSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function DiceSpinGame({ state, dispatch, onGameOver }: GameProps<DiceSpinState, DiceSpinSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.dice && (
        <div className="dm-row">
          <div className="dm-die">{state.dice[0]}</div>
          <div className="dm-die">{state.dice[1]}</div>
        </div>
      )}
      {state.phase === "betting" && (
        <div className="dm-row">
          <button data-testid="hint-target-dice-spin-roll" className="dm-btn" onClick={() => dispatch({ type:"bet", choice:"under" } as DiceSpinAction)}>Under 7 (+10)</button>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"bet", choice:"equal" } as DiceSpinAction)}>Equal 7 (+30)</button>
          <button className="dm-btn" onClick={() => dispatch({ type:"bet", choice:"over" } as DiceSpinAction)}>Over 7 (+10)</button>
        </div>
      )}
      {state.phase === "result" && (
        <>
          <div className="dm-result">{state.lastWin > 0 ? `+${state.lastWin}` : "No win"}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as DiceSpinAction)}>Next</button>
        </>
      )}
    </div>
  );
}
