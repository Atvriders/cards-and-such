import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StratBasketballState, StratBasketballAction, StratBasketballSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function StratBasketballGame({ state, dispatch, onGameOver }: GameProps<StratBasketballState, StratBasketballSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-strabask-wrap"><div className="g-strabask-done"><h2>Match!</h2><div className="g-strabask-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="g-strabask-wrap">
      <div className="g-strabask-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="g-strabask-score">{state.score} pts</div>
      {state.dice && (
        <div className="g-strabask-row">{state.dice.map((d, i) => <div key={i} className="g-strabask-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="g-strabask-btn" onClick={() => dispatch({ type:"roll" } as StratBasketballAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="g-strabask-result">+{state.lastPts}</div>
          <button className="g-strabask-btn alt" onClick={() => dispatch({ type:"next" } as StratBasketballAction)}>Next</button>
        </>
      )}
    </div>
  );
}
