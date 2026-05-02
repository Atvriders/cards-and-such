import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BiribaRState, BiribaRAction, BiribaRSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function BiribaRGame({ state, dispatch, onGameOver }: GameProps<BiribaRState, BiribaRSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="birr-wrap"><div className="birr-done"><h2>Done!</h2><div className="birr-final">{state.score} pts</div></div></div>;
  return (
    <div className="birr-wrap">
      <div className="birr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="birr-score">{state.score} pts</div>
      <div className="birr-row">{state.hand.map((c, i) => <div key={i} className={`birr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button data-testid="hint-target-biriba-r-play" className="birr-btn" onClick={() => dispatch({ type: "score" } as BiribaRAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="birr-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-biriba-r-next" className="birr-btn alt" onClick={() => dispatch({ type: "next" } as BiribaRAction)}>Next</button>
      </>}
    </div>
  );
}
