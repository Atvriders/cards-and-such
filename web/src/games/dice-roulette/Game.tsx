import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceRouletteState, DiceRouletteAction, DiceRouletteSettings, Bucket } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

const buckets: { id: Bucket; label: string; range: string }[] = [
  { id: "low", label: "Low", range: "3-6" },
  { id: "mid", label: "Mid", range: "7-10" },
  { id: "high", label: "High", range: "11-14" },
  { id: "boom", label: "Boom", range: "15-18" },
];

export function DiceRouletteGame({ state, dispatch, onGameOver }: GameProps<DiceRouletteState, DiceRouletteSettings>): JSX.Element {
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
          <div className="dm-die">{state.dice[2]}</div>
        </div>
      )}
      {state.dice && <div className="dm-sum">Sum: {state.sum}</div>}
      {state.phase === "betting" && (
        <div className="dm-row">
          {buckets.map(b => <button key={b.id} className="dm-btn" onClick={() => dispatch({ type:"bet", bucket: b.id } as DiceRouletteAction)}>{b.label} ({b.range})</button>)}
        </div>
      )}
      {state.phase === "result" && (
        <>
          <div className="dm-result">{state.lastPts > 0 ? `Win! +${state.lastPts}` : "Miss — 0"}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as DiceRouletteAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
