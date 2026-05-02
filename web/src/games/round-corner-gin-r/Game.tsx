import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RoundCornerGinRState, RoundCornerGinRAction, RoundCornerGinRSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function RoundCornerGinRGame({ state, dispatch, onGameOver }: GameProps<RoundCornerGinRState, RoundCornerGinRSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="rcgr-wrap"><div className="rcgr-done"><h2>Done!</h2><div className="rcgr-final">{state.score} pts</div></div></div>;
  return (
    <div className="rcgr-wrap">
      <div className="rcgr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="rcgr-score">{state.score} pts</div>
      <div className="rcgr-row">{state.hand.map((c, i) => <div key={i} className={`rcgr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button data-testid="hint-target-round-corner-gin-r-play" className="rcgr-btn" onClick={() => dispatch({ type: "score" } as RoundCornerGinRAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="rcgr-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-round-corner-gin-r-next" className="rcgr-btn alt" onClick={() => dispatch({ type: "next" } as RoundCornerGinRAction)}>Next</button>
      </>}
    </div>
  );
}
