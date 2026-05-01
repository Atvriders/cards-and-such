import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceCrapsMiniState, DiceCrapsMiniAction, DiceCrapsMiniSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceCrapsMiniGame({ state, dispatch, onGameOver }: GameProps<DiceCrapsMiniState, DiceCrapsMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap dice-craps-mini-theme"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap dice-craps-mini-theme">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.point !== null && <div className="dm-point">Point: {state.point}</div>}
      <div className="dm-rolls">
        {state.rolls.map((r, i) => (
          <span key={i} className={`dm-rollchip ${r.sum === 7 ? "seven" : ""}${r.sum === state.point ? " point" : ""}`}>{r.a}+{r.b}={r.sum}</span>
        ))}
      </div>
      {state.phase === "betting" && (
        <div className="dm-row">
          <button className="dm-btn" onClick={() => dispatch({ type:"bet", choice:"pass" } as DiceCrapsMiniAction)}>Pass</button>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"bet", choice:"dontpass" } as DiceCrapsMiniAction)}>Don't Pass</button>
        </div>
      )}
      {state.phase === "result" && (
        <>
          <div className="dm-result">{state.outcome === "push" ? "Push (12) — 0" : state.lastPts > 0 ? `Win! +${state.lastPts}` : "Lose — 0"}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as DiceCrapsMiniAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
