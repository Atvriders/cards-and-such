import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BrazilianCanastaRState, BrazilianCanastaRAction, BrazilianCanastaRSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function BrazilianCanastaRGame({ state, dispatch, onGameOver }: GameProps<BrazilianCanastaRState, BrazilianCanastaRSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="brzr-wrap"><div className="brzr-done"><h2>Done!</h2><div className="brzr-final">{state.score} pts</div></div></div>;
  return (
    <div className="brzr-wrap">
      <div className="brzr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="brzr-score">{state.score} pts</div>
      <div className="brzr-row">{state.hand.map((c, i) => <div key={i} className={`brzr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button data-testid="hint-target-brazilian-canasta-r-play" className="brzr-btn" onClick={() => dispatch({ type: "score" } as BrazilianCanastaRAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="brzr-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-brazilian-canasta-r-next" className="brzr-btn alt" onClick={() => dispatch({ type: "next" } as BrazilianCanastaRAction)}>Next</button>
      </>}
    </div>
  );
}
