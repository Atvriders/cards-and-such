import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ParityPopState, ParityPopAction, ParityPopSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function ParityPopGame({ state, dispatch, onGameOver }: GameProps<ParityPopState, ParityPopSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap parity-pop-theme"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap parity-pop-theme">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.die !== null && (
        <div className="dm-row"><div className="dm-die">{state.die}</div></div>
      )}
      {state.phase === "predict" && (
        <div className="dm-row">
          <button className="dm-btn" onClick={() => dispatch({ type:"predict", choice:"even" } as ParityPopAction)} data-testid="hint-target-paritypop-predict">Even</button>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"predict", choice:"odd" } as ParityPopAction)}>Odd</button>
        </div>
      )}
      {state.phase === "result" && (
        <>
          <div className="dm-result">{state.lastWin ? "Correct! +8" : "Wrong — 0"}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as ParityPopAction)} data-testid="hint-target-paritypop-next">Next</button>
        </>
      )}
    </div>
  );
}
