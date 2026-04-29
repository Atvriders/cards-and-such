import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StratFootballState, StratFootballAction, StratFootballSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function StratFootballGame({ state, dispatch, onGameOver }: GameProps<StratFootballState, StratFootballSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-strafoot-wrap"><div className="g-strafoot-done"><h2>Match!</h2><div className="g-strafoot-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="g-strafoot-wrap">
      <div className="g-strafoot-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="g-strafoot-score">{state.score} pts</div>
      {state.dice && (
        <div className="g-strafoot-row">{state.dice.map((d, i) => <div key={i} className="g-strafoot-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="g-strafoot-btn" onClick={() => dispatch({ type:"roll" } as StratFootballAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="g-strafoot-result">+{state.lastPts}</div>
          <button className="g-strafoot-btn alt" onClick={() => dispatch({ type:"next" } as StratFootballAction)}>Next</button>
        </>
      )}
    </div>
  );
}
