import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NegamcoBaseballState, NegamcoBaseballAction, NegamcoBaseballSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function NegamcoBaseballGame({ state, dispatch, onGameOver }: GameProps<NegamcoBaseballState, NegamcoBaseballSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-negabase-wrap"><div className="g-negabase-done"><h2>Match!</h2><div className="g-negabase-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="g-negabase-wrap">
      <div className="g-negabase-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="g-negabase-score">{state.score} pts</div>
      {state.dice && (
        <div className="g-negabase-row">{state.dice.map((d, i) => <div key={i} className="g-negabase-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="g-negabase-btn" onClick={() => dispatch({ type:"roll" } as NegamcoBaseballAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="g-negabase-result">+{state.lastPts}</div>
          <button className="g-negabase-btn alt" onClick={() => dispatch({ type:"next" } as NegamcoBaseballAction)}>Next</button>
        </>
      )}
    </div>
  );
}
