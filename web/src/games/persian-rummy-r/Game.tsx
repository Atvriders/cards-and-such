import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PersianRummyRState, PersianRummyRAction, PersianRummyRSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function PersianRummyRGame({ state, dispatch, onGameOver }: GameProps<PersianRummyRState, PersianRummyRSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="prsr-wrap"><div className="prsr-done"><h2>Done!</h2><div className="prsr-final">{state.score} pts</div></div></div>;
  return (
    <div className="prsr-wrap">
      <div className="prsr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="prsr-score">{state.score} pts</div>
      <div className="prsr-row">{state.hand.map((c, i) => <div key={i} className={`prsr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button data-testid="hint-target-persian-rummy-r-play" className="prsr-btn" onClick={() => dispatch({ type: "score" } as PersianRummyRAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="prsr-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-persian-rummy-r-next" className="prsr-btn alt" onClick={() => dispatch({ type: "next" } as PersianRummyRAction)}>Next</button>
      </>}
    </div>
  );
}
