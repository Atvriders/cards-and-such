import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function RummyRoyaleRGame({ state, dispatch, onGameOver }: GameProps<GState, object>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="ryrr-wrap"><div className="ryrr-done"><h2>Done!</h2><div className="ryrr-final">{state.score} pts</div></div></div>;
  return (
    <div className="ryrr-wrap">
      <div className="ryrr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ryrr-score">{state.score} pts</div>
      <div className="ryrr-row">{state.hand.map((c, i) => <div key={i} className={`ryrr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button data-testid="hint-target-rummy-royale-r-play" className="ryrr-btn" onClick={() => dispatch({ type: "score" } as GAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="ryrr-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-rummy-royale-r-next" className="ryrr-btn alt" onClick={() => dispatch({ type: "next" } as GAction)}>Next</button>
      </>}
    </div>
  );
}
