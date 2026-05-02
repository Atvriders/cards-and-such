import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceFortuneState, DiceFortuneAction, DiceFortuneSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceFortuneGame({ state, dispatch, onGameOver }: GameProps<DiceFortuneState, DiceFortuneSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.die !== null && (
        <div className="dm-row">
          <div className="dm-die">{state.die}</div>
          <div className="dm-die" style={{ background:"#fef9c3" }}>x{state.multiplier}</div>
        </div>
      )}
      {state.phase === "spinning" && (
        <button className="dm-btn" data-testid="hint-target-dice-fortune-roll" onClick={() => dispatch({ type:"spin" } as DiceFortuneAction)}>Spin</button>
      )}
      {state.phase === "result" && (
        <>
          <div className="dm-result">+{state.lastPts}</div>
          <button className="dm-btn alt" data-testid="hint-target-dice-fortune-next" onClick={() => dispatch({ type:"next" } as DiceFortuneAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
