import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function CanastaMexicanaRGame({ state, dispatch, onGameOver }: GameProps<GState, object>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="cmexr-wrap"><div className="cmexr-done bounce-in"><h2>Done!</h2><div className="cmexr-final">{state.score} pts</div></div></div>;
  return (
    <div className="cmexr-wrap fade-in">
      <div className="cmexr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="cmexr-score pulse">{state.score} pts</div>
      <div className="cmexr-row">{state.hand.map((c, i) => <div key={i} className={`cmexr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button data-testid="hint-target-canasta-mexicana-r-play" className="cmexr-btn" onClick={() => dispatch({ type: "score" } as GAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="cmexr-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-canasta-mexicana-r-next" className="cmexr-btn alt" onClick={() => dispatch({ type: "next" } as GAction)}>Next</button>
      </>}
    </div>
  );
}
