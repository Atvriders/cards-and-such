import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceKegelnState, DiceKegelnAction, DiceKegelnSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceKegelnGame({ state, dispatch, onGameOver }: GameProps<DiceKegelnState, DiceKegelnSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-kegeln-wrap"><div className="ds-kegeln-done"><h2>Done!</h2><div className="ds-kegeln-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ds-kegeln-wrap">
      <div className="ds-kegeln-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ds-kegeln-score">{state.score} pts</div>
      {state.dice && (
        <div className="ds-kegeln-row">{state.dice.map((d, i) => <div key={i} className="ds-kegeln-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-kegeln-btn" onClick={() => dispatch({ type:"roll" } as DiceKegelnAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-kegeln-result">+{state.lastPts}</div>
          <button className="ds-kegeln-btn alt" onClick={() => dispatch({ type:"next" } as DiceKegelnAction)}>Next</button>
        </>
      )}
    </div>
  );
}
