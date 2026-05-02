import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TripleTossState, TripleTossAction, TripleTossSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function TripleTossGame({ state, dispatch, onGameOver }: GameProps<TripleTossState, TripleTossSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap triple-toss-theme"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap triple-toss-theme">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.dice.length > 0 && (
        <div className="dm-row">{state.dice.map((d, i) => <div key={i} className="dm-die">{d}</div>)}</div>
      )}
      {state.phase === "ready" && <button data-testid="hint-target-triple-toss-action" className="dm-btn" onClick={() => dispatch({ type:"roll" } as TripleTossAction)}>Roll 3</button>}
      {state.phase === "rolled" && (
        <>
          <div className="dm-result">{state.lastLabel}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as TripleTossAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
