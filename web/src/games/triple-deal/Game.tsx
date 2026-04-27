import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TripleDealState, TripleDealAction, TripleDealSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function TripleDealGame({ state, dispatch, onGameOver }: GameProps<TripleDealState, TripleDealSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">Round {state.round} / {TOTAL_ROUNDS} — Will middle be between?</div>
      <div className="cm-score">{state.score} pts</div>
      {state.cards ? (
        <div className="cm-row">
          <div className={`cm-card ${isRed(state.cards[0]) ? "red" : "black"}`}>{cardName(state.cards[0])}</div>
          <div className={`cm-card mid ${isRed(state.cards[1]) ? "red" : "black"}`}>{cardName(state.cards[1])}</div>
          <div className={`cm-card ${isRed(state.cards[2]) ? "red" : "black"}`}>{cardName(state.cards[2])}</div>
        </div>
      ) : (
        <div className="cm-row"><div className="cm-card">?</div><div className="cm-card mid">?</div><div className="cm-card">?</div></div>
      )}
      {state.phase === "betting" && (
        <div className="cm-row">
          <button className="cm-btn" onClick={() => dispatch({ type:"bet", choice:"yes" } as TripleDealAction)}>Yes (Between)</button>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"bet", choice:"no" } as TripleDealAction)}>No (Not Between)</button>
        </div>
      )}
      {state.phase === "result" && (
        <>
          <div className="cm-result">{state.push ? "Push (tie) — 0" : state.lastWin ? "Correct! +10" : "Wrong — 0"}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as TripleDealAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
