import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KnockRummyRState, KnockRummyRAction, KnockRummyRSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function KnockRummyRGame({ state, dispatch, onGameOver }: GameProps<KnockRummyRState, KnockRummyRSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="knkr-wrap"><div className="knkr-done"><h2>Done!</h2><div className="knkr-final">{state.score} pts</div></div></div>;
  return (
    <div className="knkr-wrap">
      <div className="knkr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="knkr-score">{state.score} pts</div>
      <div className="knkr-row">{state.hand.map((c, i) => <div key={i} className={`knkr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button className="knkr-btn" onClick={() => dispatch({ type: "score" } as KnockRummyRAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="knkr-result">{state.result} — +{state.pts}</div>
        <button className="knkr-btn alt" onClick={() => dispatch({ type: "next" } as KnockRummyRAction)}>Next</button>
      </>}
    </div>
  );
}
