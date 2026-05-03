import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DoubleDownState, DoubleDownAction, DoubleDownSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DoubleDownGame({ state, dispatch, onGameOver }: GameProps<DoubleDownState, DoubleDownSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap double-down-theme"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{Math.max(0, state.score)} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap double-down-theme">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.dice && (
        <div className="dm-row">
          <div className="dm-die">{state.dice[0]}</div>
          <div className="dm-die">{state.dice[1]}</div>
        </div>
      )}
      {state.phase === "ready" && <button className="dm-btn" data-testid="hint-target-double-down-roll" onClick={() => dispatch({ type:"roll" } as DoubleDownAction)}>Roll 2</button>}
      {state.phase === "rolled" && (
        <>
          <div className="dm-result">{state.lastIsDouble ? `Doubles! +30` : `No doubles −5`}</div>
          <button className="dm-btn alt" data-testid="hint-target-double-down-next" onClick={() => dispatch({ type:"next" } as DoubleDownAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
