import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceHarvestState, DiceHarvestAction, DiceHarvestSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function DiceHarvestGame({ state, dispatch, onGameOver }: GameProps<DiceHarvestState, DiceHarvestSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.dice && (
        <div className="dm-row">
          <div className="dm-die">{state.dice[0]}</div>
          <div className="dm-die">{state.dice[1]}</div>
        </div>
      )}
      {state.phase === "roll" && (
        <button className="dm-btn" onClick={() => dispatch({ type:"roll" } as DiceHarvestAction)}>Roll</button>
      )}
      {state.phase === "result" && (
        <>
          <div className="dm-result">{state.lastWin ? `Hit! +${state.lastPts}` : "Miss — 0"}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as DiceHarvestAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
