import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceThunderPitState, DiceThunderPitAction, DiceThunderPitSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceThunderPitGame({ state, dispatch, onGameOver }: GameProps<DiceThunderPitState, DiceThunderPitSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-dicethunpit-wrap"><div className="g-dicethunpit-done"><h2>Match!</h2><div className="g-dicethunpit-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="g-dicethunpit-wrap">
      <div className="g-dicethunpit-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="g-dicethunpit-score">{state.score} pts</div>
      {state.dice && (
        <div className="g-dicethunpit-row">{state.dice.map((d, i) => <div key={i} className="g-dicethunpit-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="g-dicethunpit-btn" onClick={() => dispatch({ type:"roll" } as DiceThunderPitAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="g-dicethunpit-result">+{state.lastPts}</div>
          <button className="g-dicethunpit-btn alt" onClick={() => dispatch({ type:"next" } as DiceThunderPitAction)}>Next</button>
        </>
      )}
    </div>
  );
}
