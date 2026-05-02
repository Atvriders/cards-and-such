import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ConquianRState, ConquianRAction, ConquianRSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function ConquianRGame({ state, dispatch, onGameOver }: GameProps<ConquianRState, ConquianRSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="cnqr-wrap"><div className="cnqr-done"><h2>Done!</h2><div className="cnqr-final">{state.score} pts</div></div></div>;
  return (
    <div className="cnqr-wrap">
      <div className="cnqr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="cnqr-score">{state.score} pts</div>
      <div className="cnqr-row">{state.hand.map((c, i) => <div key={i} className={`cnqr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button data-testid="hint-target-conquian-r-play" className="cnqr-btn" onClick={() => dispatch({ type: "score" } as ConquianRAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="cnqr-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-conquian-r-next" className="cnqr-btn alt" onClick={() => dispatch({ type: "next" } as ConquianRAction)}>Next</button>
      </>}
    </div>
  );
}
