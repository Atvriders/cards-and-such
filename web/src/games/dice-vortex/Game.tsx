import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceVortexState, DiceVortexAction, DiceVortexSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceVortexGame({ state, dispatch, onGameOver }: GameProps<DiceVortexState, DiceVortexSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.phase === "choosing" && (
        <>
          <div className="dm-info">Pick a multiplier — die must roll &gt;= multiplier or bust!</div>
          <div className="dm-row">
            {[1, 2, 3, 4].map(m => (
              <button key={m} className="dm-btn" onClick={() => dispatch({ type:"pick", multiplier: m } as DiceVortexAction)}>x{m}</button>
            ))}
          </div>
        </>
      )}
      {state.phase === "scored" && state.die !== null && (
        <>
          <div className="dm-row">
            <div className="dm-die">{state.die}</div>
            <div className="dm-mult">×{state.multiplier}</div>
          </div>
          <div className="dm-result">{state.bust ? `Bust! Die (${state.die}) < x${state.multiplier} → 0` : `+${state.pts}`}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as DiceVortexAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
