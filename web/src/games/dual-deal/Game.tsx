import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DualDealState, DualDealAction, DualDealSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DualDealGame({ state, dispatch, onGameOver }: GameProps<DualDealState, DualDealSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">Round {state.round} / {TOTAL_ROUNDS} — Which will be higher?</div>
      <div className="cm-score">{state.score} pts</div>
      {state.cards ? (
        <div className="cm-row">
          <div className={`cm-card ${isRed(state.cards[0]) ? "red" : "black"}`}>{cardName(state.cards[0])}</div>
          <div className={`cm-card ${isRed(state.cards[1]) ? "red" : "black"}`}>{cardName(state.cards[1])}</div>
        </div>
      ) : (
        <div className="cm-row"><div className="cm-card">?</div><div className="cm-card">?</div></div>
      )}
      {state.phase === "betting" && (
        <div className="cm-row">
          <button data-testid="hint-target-dual-deal-primary" className="cm-btn" onClick={() => dispatch({ type:"bet", choice:"left" } as DualDealAction)}>Left Higher</button>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"bet", choice:"right" } as DualDealAction)}>Right Higher</button>
        </div>
      )}
      {state.phase === "result" && (
        <>
          <div className="cm-result">{state.push ? "Push (tie) — 0" : state.lastWin ? "Correct! +10" : "Wrong — 0"}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as DualDealAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
