import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceBridgeState, DiceBridgeAction, DiceBridgeSettings } from "./state.js";
import { isTerminal, SEGMENTS, MAX_ROLLS } from "./state.js";
import "./Game.css";

export function DiceBridgeGame({ state, dispatch, onGameOver }: GameProps<DiceBridgeState, DiceBridgeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="db-wrap"><div className="db-done"><h2>Done!</h2><div>Bridge segments: {state.segments} / {SEGMENTS}</div><div className="db-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="db-wrap">
      <div className="db-info">Rolls used: {state.rollsUsed} / {MAX_ROLLS}</div>
      <div className="db-info">Segments: {state.segments} / {SEGMENTS}</div>
      <div className="db-bridge">
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <div key={i} className={`db-segment ${i < state.segments ? "built" : ""}`}>{i < state.segments ? "▰" : "▱"}</div>
        ))}
      </div>
      {state.dice && (
        <div className="db-row">
          <div className="db-die">{state.dice[0]}</div>
          <div className="db-die">{state.dice[1]}</div>
          <div className={`db-result ${state.lastSegment ? "ok" : "no"}`}>sum {state.dice[0] + state.dice[1]} {state.lastSegment ? "✓" : "✗"}</div>
        </div>
      )}
      <div className="db-row">
        <button className="db-btn" onClick={() => dispatch({ type: "roll" } as DiceBridgeAction)}>Roll</button>
        <button className="db-btn alt" onClick={() => dispatch({ type: "bank" } as DiceBridgeAction)}>Bank</button>
      </div>
    </div>
  );
}
