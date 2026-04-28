import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceSjoelbakState, DiceSjoelbakAction, DiceSjoelbakSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceSjoelbakGame({ state, dispatch, onGameOver }: GameProps<DiceSjoelbakState, DiceSjoelbakSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-sjoelbak-wrap"><div className="ds-sjoelbak-done"><h2>Done!</h2><div className="ds-sjoelbak-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ds-sjoelbak-wrap">
      <div className="ds-sjoelbak-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ds-sjoelbak-score">{state.score} pts</div>
      {state.dice && (
        <div className="ds-sjoelbak-row">{state.dice.map((d, i) => <div key={i} className="ds-sjoelbak-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-sjoelbak-btn" onClick={() => dispatch({ type:"roll" } as DiceSjoelbakAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-sjoelbak-result">+{state.lastPts}</div>
          <button className="ds-sjoelbak-btn alt" onClick={() => dispatch({ type:"next" } as DiceSjoelbakAction)}>Next</button>
        </>
      )}
    </div>
  );
}
