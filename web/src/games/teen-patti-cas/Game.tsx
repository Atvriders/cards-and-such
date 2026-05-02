import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TeenPattiCasState, TeenPattiCasAction, TeenPattiCasSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function TeenPattiCasGame({ state, dispatch, onGameOver }: GameProps<TeenPattiCasState, TeenPattiCasSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="tp-c-wrap"><div className="tp-c-done"><h2>Done!</h2><div className="tp-c-final">{state.score} pts</div></div></div>;
  return (
    <div className="tp-c-wrap">
      <div className="tp-c-info">Round {state.round} / {TOTAL_ROUNDS} — Your hand: {state.rank}</div>
      <div className="tp-c-score">{state.score} pts</div>
      <div className="tp-c-info">You:</div>
      <div className="tp-c-row">{state.you.map((c, i) => <div key={i} className={`tp-c-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "see" && <div className="tp-c-row">
        <button data-testid="hint-target-teen-patti-cas-primary" className="tp-c-btn" onClick={() => dispatch({ type: "play" } as TeenPattiCasAction)}>Play</button>
        <button className="tp-c-btn alt" onClick={() => dispatch({ type: "fold" } as TeenPattiCasAction)}>Fold</button>
      </div>}
      {state.phase === "scored" && <>
        <div className="tp-c-info">CPU:</div>
        <div className="tp-c-row">{state.cpu.map((c, i) => <div key={i} className={`tp-c-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
        <div className="tp-c-result">{state.result} — +{state.pts}</div>
        <button className="tp-c-btn alt" onClick={() => dispatch({ type: "next" } as TeenPattiCasAction)}>Next</button>
      </>}
    </div>
  );
}
