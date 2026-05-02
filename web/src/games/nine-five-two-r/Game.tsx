import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function NineFiveTwoRGame({ state, dispatch, onGameOver }: GameProps<GState, object>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="n52r-wrap"><div className="n52r-done"><h2>Done!</h2><div className="n52r-final">{state.score} pts</div></div></div>;
  return (
    <div className="n52r-wrap">
      <div className="n52r-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="n52r-score">{state.score} pts</div>
      <div className="n52r-row">{state.hand.map((c, i) => <div key={i} className={`n52r-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button data-testid="hint-target-nine-five-two-r-play" className="n52r-btn" onClick={() => dispatch({ type: "score" } as GAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="n52r-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-nine-five-two-r-next" className="n52r-btn alt" onClick={() => dispatch({ type: "next" } as GAction)}>Next</button>
      </>}
    </div>
  );
}
