import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceCandlepinState, DiceCandlepinAction, DiceCandlepinSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceCandlepinGame({ state, dispatch, onGameOver }: GameProps<DiceCandlepinState, DiceCandlepinSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-candlepin-wrap"><div className="ds-candlepin-done"><h2>Done!</h2><div className="ds-candlepin-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ds-candlepin-wrap">
      <div className="ds-candlepin-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ds-candlepin-score">{state.score} pts</div>
      {state.dice && (
        <div className="ds-candlepin-row">{state.dice.map((d, i) => <div key={i} className="ds-candlepin-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-candlepin-btn" onClick={() => dispatch({ type:"roll" } as DiceCandlepinAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-candlepin-result">+{state.lastPts}</div>
          <button className="ds-candlepin-btn alt" onClick={() => dispatch({ type:"next" } as DiceCandlepinAction)}>Next</button>
        </>
      )}
    </div>
  );
}
