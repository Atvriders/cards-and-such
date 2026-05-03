import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DragonTigerCasState, DragonTigerCasAction, DragonTigerCasSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function DragonTigerCasGame({ state, dispatch, onGameOver }: GameProps<DragonTigerCasState, DragonTigerCasSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="drt-c-wrap"><div className="drt-c-done"><h2>Done!</h2><div className="drt-c-final">{state.score} pts</div></div></div>;
  return (
    <div className="drt-c-wrap">
      <div className="drt-c-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="drt-c-score">{state.score} pts</div>
      {state.left !== null && state.right !== null && <div className="drt-c-row">
        <div className={`drt-c-card ${isRed(state.left) ? "red" : "black"}`}>{cardName(state.left)}</div>
        {state.middle !== null && <div className={`drt-c-card ${isRed(state.middle) ? "red" : "black"}`}>{cardName(state.middle)}</div>}
        <div className={`drt-c-card ${isRed(state.right) ? "red" : "black"}`}>{cardName(state.right)}</div>
      </div>}
      {state.phase === "ready" && <button data-testid="hint-target-dragon-tiger-cas-primary" className="drt-c-btn" onClick={() => dispatch({ type: "play" } as DragonTigerCasAction)}>Play</button>}
      {state.phase === "scored" && <>
        <div className="drt-c-result">{state.result}</div>
        <button data-testid="hint-target-dragon-tiger-cas-secondary" className="drt-c-btn alt" onClick={() => dispatch({ type: "next" } as DragonTigerCasAction)}>Next</button>
      </>}
    </div>
  );
}
