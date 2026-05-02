import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CubanCanastaRState, CubanCanastaRAction, CubanCanastaRSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function CubanCanastaRGame({ state, dispatch, onGameOver }: GameProps<CubanCanastaRState, CubanCanastaRSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="cubr-wrap"><div className="cubr-done"><h2>Done!</h2><div className="cubr-final">{state.score} pts</div></div></div>;
  return (
    <div className="cubr-wrap">
      <div className="cubr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="cubr-score">{state.score} pts</div>
      <div className="cubr-row">{state.hand.map((c, i) => <div key={i} className={`cubr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button data-testid="hint-target-cuban-canasta-r-play" className="cubr-btn" onClick={() => dispatch({ type: "score" } as CubanCanastaRAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="cubr-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-cuban-canasta-r-next" className="cubr-btn alt" onClick={() => dispatch({ type: "next" } as CubanCanastaRAction)}>Next</button>
      </>}
    </div>
  );
}
