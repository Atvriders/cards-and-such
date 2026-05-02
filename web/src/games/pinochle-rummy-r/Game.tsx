import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function PinochleRummyRGame({ state, dispatch, onGameOver }: GameProps<GState, object>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="pncr-wrap"><div className="pncr-done"><h2>Done!</h2><div className="pncr-final">{state.score} pts</div></div></div>;
  return (
    <div className="pncr-wrap">
      <div className="pncr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="pncr-score">{state.score} pts</div>
      <div className="pncr-row">{state.hand.map((c, i) => <div key={i} className={`pncr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button data-testid="hint-target-pinochle-rummy-r-play" className="pncr-btn" onClick={() => dispatch({ type: "score" } as GAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="pncr-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-pinochle-rummy-r-next" className="pncr-btn alt" onClick={() => dispatch({ type: "next" } as GAction)}>Next</button>
      </>}
    </div>
  );
}
