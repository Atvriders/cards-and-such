import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceHalveItState, DiceHalveItAction, DiceHalveItSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceHalveItGame({ state, dispatch, onGameOver }: GameProps<DiceHalveItState, DiceHalveItSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-halve-it-wrap"><div className="ds-halve-it-done"><h2>Done!</h2><div className="ds-halve-it-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ds-halve-it-wrap">
      <div className="ds-halve-it-info">Round {state.round} / {TOTAL_ROUNDS} — Hit 7+ or your score halves!</div>
      <div className="ds-halve-it-score">{state.score} pts</div>
      {state.dice && (
        <div className="ds-halve-it-row">{state.dice.map((d, i) => <div key={i} className="ds-halve-it-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-halve-it-btn" onClick={() => dispatch({ type:"roll" } as DiceHalveItAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-halve-it-result">{state.halved ? "HALVED!" : "+" + state.lastPts}</div>
          <button className="ds-halve-it-btn alt" onClick={() => dispatch({ type:"next" } as DiceHalveItAction)}>Next</button>
        </>
      )}
    </div>
  );
}
