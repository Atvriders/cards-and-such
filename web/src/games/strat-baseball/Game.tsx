import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StratBaseballState, StratBaseballAction, StratBaseballSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function StratBaseballGame({ state, dispatch, onGameOver }: GameProps<StratBaseballState, StratBaseballSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-strabase-wrap"><div className="g-strabase-done"><h2>Match!</h2><div className="g-strabase-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="g-strabase-wrap">
      <div className="g-strabase-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="g-strabase-score">{state.score} pts</div>
      {state.dice && (
        <div className="g-strabase-row">{state.dice.map((d, i) => <div key={i} className="g-strabase-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="g-strabase-btn" onClick={() => dispatch({ type:"roll" } as StratBaseballAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="g-strabase-result">+{state.lastPts}</div>
          <button className="g-strabase-btn alt" onClick={() => dispatch({ type:"next" } as StratBaseballAction)}>Next</button>
        </>
      )}
    </div>
  );
}
