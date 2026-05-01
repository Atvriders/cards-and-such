import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BoliviaCanastaRState, BoliviaCanastaRAction, BoliviaCanastaRSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function BoliviaCanastaRGame({ state, dispatch, onGameOver }: GameProps<BoliviaCanastaRState, BoliviaCanastaRSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="bolr-wrap"><div className="bolr-done"><h2>Done!</h2><div className="bolr-final">{state.score} pts</div></div></div>;
  return (
    <div className="bolr-wrap">
      <div className="bolr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="bolr-score">{state.score} pts</div>
      <div className="bolr-row">{state.hand.map((c, i) => <div key={i} className={`bolr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button className="bolr-btn" onClick={() => dispatch({ type: "score" } as BoliviaCanastaRAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="bolr-result">{state.result} — +{state.pts}</div>
        <button className="bolr-btn alt" onClick={() => dispatch({ type: "next" } as BoliviaCanastaRAction)}>Next</button>
      </>}
    </div>
  );
}
