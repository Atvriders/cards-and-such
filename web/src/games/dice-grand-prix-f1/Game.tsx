import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceGrandPrixF1State, DiceGrandPrixF1Action, DiceGrandPrixF1Settings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceGrandPrixF1Game({ state, dispatch, onGameOver }: GameProps<DiceGrandPrixF1State, DiceGrandPrixF1Settings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-dicegranprixf1-wrap"><div className="g-dicegranprixf1-done"><h2>Match!</h2><div className="g-dicegranprixf1-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="g-dicegranprixf1-wrap">
      <div className="g-dicegranprixf1-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="g-dicegranprixf1-score">{state.score} pts</div>
      {state.dice && (
        <div className="g-dicegranprixf1-row">{state.dice.map((d, i) => <div key={i} className="g-dicegranprixf1-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="g-dicegranprixf1-btn" onClick={() => dispatch({ type:"roll" } as DiceGrandPrixF1Action)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="g-dicegranprixf1-result">+{state.lastPts}</div>
          <button className="g-dicegranprixf1-btn alt" onClick={() => dispatch({ type:"next" } as DiceGrandPrixF1Action)}>Next</button>
        </>
      )}
    </div>
  );
}
