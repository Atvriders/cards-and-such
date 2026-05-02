import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function PapluRGame({ state, dispatch, onGameOver }: GameProps<GState, object>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="ppur-wrap"><div className="ppur-done"><h2>Done!</h2><div className="ppur-final">{state.score} pts</div></div></div>;
  return (
    <div className="ppur-wrap">
      <div className="ppur-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ppur-score">{state.score} pts</div>
      <div className="ppur-row">{state.hand.map((c, i) => <div key={i} className={`ppur-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button data-testid="hint-target-paplu-r-play" className="ppur-btn" onClick={() => dispatch({ type: "score" } as GAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="ppur-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-paplu-r-next" className="ppur-btn alt" onClick={() => dispatch({ type: "next" } as GAction)}>Next</button>
      </>}
    </div>
  );
}
