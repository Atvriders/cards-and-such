import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceStadiumState, DiceStadiumAction, DiceStadiumSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceStadiumGame({ state, dispatch, onGameOver }: GameProps<DiceStadiumState, DiceStadiumSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dstd-wrap dstd-theme"><div className="dstd-done"><h2>Final Whistle!</h2><div className="dstd-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dstd-wrap dstd-theme">
      <div className="dstd-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dstd-score">{state.score} pts</div>
      {state.dice && (
        <div className="dstd-row">
          {state.dice.map((d, i) => <div key={i} className="dstd-die">{d}</div>)}
          <div className="dstd-sum">Sum: {state.dice[0] + state.dice[1] + state.dice[2]}</div>
        </div>
      )}
      {state.phase === "cheering" && (
        <>
          <div className="dstd-info">Pick a cheer:</div>
          <div className="dstd-row">
            <button data-testid="hint-target-dice-stadium-roll" className="dstd-btn low" onClick={() => dispatch({ type:"cheer", level:"low" } as DiceStadiumAction)}>Low (sum)</button>
            <button className="dstd-btn mid" onClick={() => dispatch({ type:"cheer", level:"mid" } as DiceStadiumAction)}>Mid (×1.5 if sum≥10)</button>
            <button className="dstd-btn high" onClick={() => dispatch({ type:"cheer", level:"high" } as DiceStadiumAction)}>Roar (×2 if sum≥14)</button>
          </div>
        </>
      )}
      {state.phase === "result" && (
        <>
          <div className="dstd-result">+{state.lastPts} (cheer: {state.cheer})</div>
          <button className="dstd-btn alt" onClick={() => dispatch({ type:"next" } as DiceStadiumAction)}>Next</button>
        </>
      )}
    </div>
  );
}
