import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ApbaFootballState, ApbaFootballAction, ApbaFootballSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function ApbaFootballGame({ state, dispatch, onGameOver }: GameProps<ApbaFootballState, ApbaFootballSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-apbafoot-wrap"><div className="g-apbafoot-done"><h2>Match!</h2><div className="g-apbafoot-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="g-apbafoot-wrap">
      <div className="g-apbafoot-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="g-apbafoot-score">{state.score} pts</div>
      {state.dice && (
        <div className="g-apbafoot-row">{state.dice.map((d, i) => <div key={i} className="g-apbafoot-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="g-apbafoot-btn" onClick={() => dispatch({ type:"roll" } as ApbaFootballAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="g-apbafoot-result">+{state.lastPts}</div>
          <button className="g-apbafoot-btn alt" onClick={() => dispatch({ type:"next" } as ApbaFootballAction)}>Next</button>
        </>
      )}
    </div>
  );
}
