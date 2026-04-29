import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceGulfDartsState, DiceGulfDartsAction, DiceGulfDartsSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceGulfDartsGame({ state, dispatch, onGameOver }: GameProps<DiceGulfDartsState, DiceGulfDartsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-dicegulfdart-wrap"><div className="g-dicegulfdart-done"><h2>Match!</h2><div className="g-dicegulfdart-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="g-dicegulfdart-wrap">
      <div className="g-dicegulfdart-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="g-dicegulfdart-score">{state.score} pts</div>
      {state.dice && (
        <div className="g-dicegulfdart-row">{state.dice.map((d, i) => <div key={i} className="g-dicegulfdart-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="g-dicegulfdart-btn" onClick={() => dispatch({ type:"roll" } as DiceGulfDartsAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="g-dicegulfdart-result">+{state.lastPts}</div>
          <button className="g-dicegulfdart-btn alt" onClick={() => dispatch({ type:"next" } as DiceGulfDartsAction)}>Next</button>
        </>
      )}
    </div>
  );
}
