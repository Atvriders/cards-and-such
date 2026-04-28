import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceBakeryState, DiceBakeryAction, DiceBakerySettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceBakeryGame({ state, dispatch, onGameOver }: GameProps<DiceBakeryState, DiceBakerySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.dice.length > 0 && (
        <div className="dm-row">
          {state.dice.map((d, i) => <div key={i} className="dm-die">{d}</div>)}
        </div>
      )}
      {state.phase === "roll" && (
        <button className="dm-btn" onClick={() => dispatch({ type:"roll" } as DiceBakeryAction)}>Bake</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="dm-result">Loaves: +{state.lastPts}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as DiceBakeryAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
