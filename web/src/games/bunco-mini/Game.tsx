import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BuncoMiniState, BuncoMiniAction, BuncoMiniSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function BuncoMiniGame({ state, dispatch, onGameOver }: GameProps<BuncoMiniState, BuncoMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div>Buncos: {state.buncos}</div><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS} (target: {state.round})</div>
      <div className="dm-score">{state.score} pts</div>
      {state.dice.length > 0 && (
        <div className="dm-row">
          {state.dice.map((d, i) => <div key={i} className="dm-die">{d}</div>)}
        </div>
      )}
      {state.phase === "rolling" && (
        <button className="dm-btn" onClick={() => dispatch({ type:"roll" } as BuncoMiniAction)}>Roll 3</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="dm-result">{state.lastPts === 21 ? "BUNCO! +21" : `+${state.lastPts}`}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as BuncoMiniAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
