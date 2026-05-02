import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function WildCardRummyRGame({ state, dispatch, onGameOver }: GameProps<GState, object>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="wcrr-wrap"><div className="wcrr-done"><h2>Done!</h2><div className="wcrr-final">{state.score} pts</div></div></div>;
  return (
    <div className="wcrr-wrap">
      <div className="wcrr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="wcrr-score">{state.score} pts</div>
      <div className="wcrr-row">{state.hand.map((c, i) => <div key={i} className={`wcrr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button data-testid="hint-target-wild-card-rummy-r-play" className="wcrr-btn" onClick={() => dispatch({ type: "score" } as GAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="wcrr-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-wild-card-rummy-r-next" className="wcrr-btn alt" onClick={() => dispatch({ type: "next" } as GAction)}>Next</button>
      </>}
    </div>
  );
}
