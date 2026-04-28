import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DicePetanqueState, DicePetanqueAction, DicePetanqueSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DicePetanqueGame({ state, dispatch, onGameOver }: GameProps<DicePetanqueState, DicePetanqueSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-petanque-wrap"><div className="ds-petanque-done"><h2>Done!</h2><div className="ds-petanque-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ds-petanque-wrap">
      <div className="ds-petanque-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ds-petanque-score">{state.score} pts</div>
      {state.dice && (
        <div className="ds-petanque-row">{state.dice.map((d, i) => <div key={i} className="ds-petanque-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-petanque-btn" onClick={() => dispatch({ type:"roll" } as DicePetanqueAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-petanque-result">+{state.lastPts}</div>
          <button className="ds-petanque-btn alt" onClick={() => dispatch({ type:"next" } as DicePetanqueAction)}>Next</button>
        </>
      )}
    </div>
  );
}
