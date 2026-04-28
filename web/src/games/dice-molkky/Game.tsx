import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceMolkkyState, DiceMolkkyAction, DiceMolkkySettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceMolkkyGame({ state, dispatch, onGameOver }: GameProps<DiceMolkkyState, DiceMolkkySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-molkky-wrap"><div className="ds-molkky-done"><h2>Done!</h2><div className="ds-molkky-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ds-molkky-wrap">
      <div className="ds-molkky-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ds-molkky-score">{state.score} pts</div>
      {state.dice && (
        <div className="ds-molkky-row">{state.dice.map((d, i) => <div key={i} className="ds-molkky-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-molkky-btn" onClick={() => dispatch({ type:"roll" } as DiceMolkkyAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-molkky-result">+{state.lastPts}</div>
          <button className="ds-molkky-btn alt" onClick={() => dispatch({ type:"next" } as DiceMolkkyAction)}>Next</button>
        </>
      )}
    </div>
  );
}
