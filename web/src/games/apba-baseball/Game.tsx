import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ApbaBaseballState, ApbaBaseballAction, ApbaBaseballSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function ApbaBaseballGame({ state, dispatch, onGameOver }: GameProps<ApbaBaseballState, ApbaBaseballSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-apbabase-wrap"><div className="g-apbabase-done"><h2>Match!</h2><div className="g-apbabase-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="g-apbabase-wrap">
      <div className="g-apbabase-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="g-apbabase-score">{state.score} pts</div>
      {state.dice && (
        <div className="g-apbabase-row">{state.dice.map((d, i) => <div key={i} className="g-apbabase-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="g-apbabase-btn" onClick={() => dispatch({ type:"roll" } as ApbaBaseballAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="g-apbabase-result">+{state.lastPts}</div>
          <button className="g-apbabase-btn alt" onClick={() => dispatch({ type:"next" } as ApbaBaseballAction)}>Next</button>
        </>
      )}
    </div>
  );
}
