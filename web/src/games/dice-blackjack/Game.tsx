import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceBlackjackState, DiceBlackjackAction, DiceBlackjackSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, TARGET } from "./state.js";
import "./Game.css";

export function DiceBlackjackGame({ state, dispatch, onGameOver }: GameProps<DiceBlackjackState, DiceBlackjackSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS} — Target {TARGET}</div>
      <div className="dm-score">Total Score: {state.score}</div>
      <div className="dm-row">
        {state.rolls.map((r, i) => <div key={i} className="dm-die">{r}</div>)}
      </div>
      <div className="dm-sum">Round Total: {state.total}</div>
      {state.phase === "playing" && (
        <div className="dm-row">
          <button className="dm-btn" onClick={() => dispatch({ type:"roll" } as DiceBlackjackAction)}>Roll</button>
          <button className="dm-btn alt" disabled={state.total === 0} onClick={() => dispatch({ type:"stand" } as DiceBlackjackAction)}>Stand</button>
        </div>
      )}
      {state.phase === "scored" && (
        <>
          <div className="dm-result">{state.busted ? `Bust at ${state.total} — 0` : `+${state.lastPts}`}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as DiceBlackjackAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
