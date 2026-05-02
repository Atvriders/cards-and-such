import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function QuickRummyRGame({ state, dispatch, onGameOver }: GameProps<GState, object>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="qkrr-wrap"><div className="qkrr-done"><h2>Done!</h2><div className="qkrr-final">{state.score} pts</div></div></div>;
  return (
    <div className="qkrr-wrap">
      <div className="qkrr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="qkrr-score">{state.score} pts</div>
      <div className="qkrr-row">{state.hand.map((c, i) => <div key={i} className={`qkrr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button data-testid="hint-target-quick-rummy-r-play" className="qkrr-btn" onClick={() => dispatch({ type: "score" } as GAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="qkrr-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-quick-rummy-r-next" className="qkrr-btn alt" onClick={() => dispatch({ type: "next" } as GAction)}>Next</button>
      </>}
    </div>
  );
}
