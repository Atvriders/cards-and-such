import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceTreasureMapState, DiceTreasureMapAction, DiceTreasureMapSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function DiceTreasureMapGame({ state, dispatch, onGameOver }: GameProps<DiceTreasureMapState, DiceTreasureMapSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap">
      <div className="dm-info">🗺️ Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.rolls.length > 0 && (
        <div className="dm-row">
          {state.rolls.map((r, i) => <div key={i} className="dm-die">{r}</div>)}
        </div>
      )}
      {state.phase === "rolling" && (
        <button className="dm-btn" onClick={() => dispatch({ type:"roll" } as DiceTreasureMapAction)}>Roll Dice</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="dm-result">+{state.lastPts} pts</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as DiceTreasureMapAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
