import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DragonTigerCasState, DragonTigerCasAction, DragonTigerCasSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function DragonTigerCasGame({ state, dispatch, onGameOver }: GameProps<DragonTigerCasState, DragonTigerCasSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.left !== null && state.right !== null && <div className="dm-row">
        <div className={`dm-card ${isRed(state.left) ? "red" : "black"}`}>{cardName(state.left)}</div>
        {state.middle !== null && <div className={`dm-card ${isRed(state.middle) ? "red" : "black"}`}>{cardName(state.middle)}</div>}
        <div className={`dm-card ${isRed(state.right) ? "red" : "black"}`}>{cardName(state.right)}</div>
      </div>}
      {state.phase === "ready" && <button className="dm-btn" onClick={() => dispatch({ type: "play" } as DragonTigerCasAction)}>Play</button>}
      {state.phase === "scored" && <>
        <div className="dm-result">{state.result}</div>
        <button className="dm-btn alt" onClick={() => dispatch({ type: "next" } as DragonTigerCasAction)}>Next</button>
      </>}
    </div>
  );
}
