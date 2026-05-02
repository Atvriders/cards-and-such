import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ItalianCanastaRState, ItalianCanastaRAction, ItalianCanastaRSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function ItalianCanastaRGame({ state, dispatch, onGameOver }: GameProps<ItalianCanastaRState, ItalianCanastaRSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="itlr-wrap"><div className="itlr-done"><h2>Done!</h2><div className="itlr-final">{state.score} pts</div></div></div>;
  return (
    <div className="itlr-wrap">
      <div className="itlr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="itlr-score">{state.score} pts</div>
      <div className="itlr-row">{state.hand.map((c, i) => <div key={i} className={`itlr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button data-testid="hint-target-italian-canasta-r-play" className="itlr-btn" onClick={() => dispatch({ type: "score" } as ItalianCanastaRAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="itlr-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-italian-canasta-r-next" className="itlr-btn alt" onClick={() => dispatch({ type: "next" } as ItalianCanastaRAction)}>Next</button>
      </>}
    </div>
  );
}
