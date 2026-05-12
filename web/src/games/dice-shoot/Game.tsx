import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceShootState, DiceShootAction, DiceShootSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceShootGame({ state, dispatch, onGameOver }: GameProps<DiceShootState, DiceShootSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done bounce-in"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap fade-in">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score pulse">{state.score} pts</div>
      {state.target !== null && (
        <div className="dm-row">
          <div className="dm-die" style={{ background:"#ffeaa7" }}>Target: {state.target}</div>
          {state.roll !== null && <div className="dm-die">Roll: {state.roll}</div>}
        </div>
      )}
      {state.phase === "set-target" && (
        <button className="dm-btn" onClick={() => dispatch({ type:"setTarget" } as DiceShootAction)}>Set Target</button>
      )}
      {state.phase === "roll" && (
        <button data-testid="hint-target-dice-shoot-action" className="dm-btn alt" onClick={() => dispatch({ type:"roll" } as DiceShootAction)}>Roll</button>
      )}
      {state.phase === "result" && (
        <>
          <div className="dm-result">{state.lastWin ? "Hit! +30" : "Miss — 0"}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as DiceShootAction)}>Next</button>
        </>
      )}
    </div>
  );
}
