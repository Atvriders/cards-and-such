import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ReplayBaseballState, ReplayBaseballAction, ReplayBaseballSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function ReplayBaseballGame({ state, dispatch, onGameOver }: GameProps<ReplayBaseballState, ReplayBaseballSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-replbase-wrap"><div className="g-replbase-done"><h2>Match!</h2><div className="g-replbase-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="g-replbase-wrap">
      <div className="g-replbase-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="g-replbase-score">{state.score} pts</div>
      {state.dice && (
        <div className="g-replbase-row">{state.dice.map((d, i) => <div key={i} className="g-replbase-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="g-replbase-btn" onClick={() => dispatch({ type:"roll" } as ReplayBaseballAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="g-replbase-result">+{state.lastPts}</div>
          <button className="g-replbase-btn alt" onClick={() => dispatch({ type:"next" } as ReplayBaseballAction)}>Next</button>
        </>
      )}
    </div>
  );
}
