import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceCoinFlipState, DiceCoinFlipAction, DiceCoinFlipSettings } from "./state.js";
import { isTerminal, TOTAL_FLIPS } from "./state.js";
import "./Game.css";
export function DiceCoinFlipGame({ state, dispatch, onGameOver }: GameProps<DiceCoinFlipState, DiceCoinFlipSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-info">Flip {state.flipIdx + (state.phase === "predict" ? 1 : 0)} / {TOTAL_FLIPS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.lastDie && <div className="dm-dice">Die: {state.lastDie} ({state.lastHeads ? "Heads" : "Tails"}) — {state.lastWin ? "Win!" : "Lose"}</div>}
      {state.phase === "predict" && (
        <div className="dm-row">
          <button className="dm-btn" onClick={() => dispatch({ type:"predict", choice:"heads" } as DiceCoinFlipAction)}>Heads (Even)</button>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"predict", choice:"tails" } as DiceCoinFlipAction)}>Tails (Odd)</button>
        </div>
      )}
      {state.phase === "result" && <button className="dm-btn" onClick={() => dispatch({ type:"next" } as DiceCoinFlipAction)}>Next</button>}
    </div>
  );
}
