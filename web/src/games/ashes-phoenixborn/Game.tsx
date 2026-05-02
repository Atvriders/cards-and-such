import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AshesPhoenixbornState, AshesPhoenixbornAction, AshesPhoenixbornSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function AshesPhoenixbornGame({ state, dispatch, onGameOver }: GameProps<AshesPhoenixbornState, AshesPhoenixbornSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done"><h2>🔥 Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  const ySum = state.you.reduce((a,b)=>a+b,0);
  return (
    <div className="dm-wrap">
      <div className="dm-info">🔥 Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.target > 0 && <div className="dm-rule">Foe target: {state.target}</div>}
      {state.you.length > 0 && (
        <>
          <div className="dm-rule">You ({ySum})</div>
          <div className="dm-row">{state.you.map((r, k) => <div key={k} className="dm-die">{r}</div>)}</div>
        </>
      )}
      {state.phase === "rolling" && (
        <button data-testid="hint-target-ashes-phoenixborn-primary" className="dm-btn" onClick={() => dispatch({ type:"roll" } as AshesPhoenixbornAction)}>Roll</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="dm-result">+{state.lastPts} pts</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as AshesPhoenixbornAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
