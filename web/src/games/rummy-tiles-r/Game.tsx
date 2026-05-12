import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function RummyTilesRGame({ state, dispatch, onGameOver }: GameProps<GState, object>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="rtlr-wrap"><div className="rtlr-done bounce-in"><h2>Done!</h2><div className="rtlr-final">{state.score} pts</div></div></div>;
  return (
    <div className="rtlr-wrap fade-in">
      <div className="rtlr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="rtlr-score pulse">{state.score} pts</div>
      <div className="rtlr-row">{state.hand.map((c, i) => <div key={i} className={`rtlr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button data-testid="hint-target-rummy-tiles-r-play" className="rtlr-btn" onClick={() => dispatch({ type: "score" } as GAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="rtlr-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-rummy-tiles-r-next" className="rtlr-btn alt" onClick={() => dispatch({ type: "next" } as GAction)}>Next</button>
      </>}
    </div>
  );
}
