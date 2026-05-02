import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QuintDealState, QuintDealAction, QuintDealSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function QuintDealGame({ state, dispatch, onGameOver }: GameProps<QuintDealState, QuintDealSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">Round {state.round} / {TOTAL_ROUNDS} — Tap the highest card</div>
      <div className="cm-score">{state.score} pts</div>
      <div className="cm-row">
        {state.hand.map((c, i) => {
          let cls = `cm-card ${isRed(c) ? "red" : "black"}`;
          if (state.phase === "result") {
            if (i === state.highestIndex) cls += " correct";
            else if (i === state.guess && i !== state.highestIndex) cls += " wrong";
          }
          return (
            <button key={i} className={cls} disabled={state.phase !== "guessing"} onClick={() => dispatch({ type:"guess", index:i } as QuintDealAction)}>
              {cardName(c)}
            </button>
          );
        })}
      </div>
      {state.phase === "result" && (
        <>
          <div className="cm-result">{state.lastWin ? "Correct! +10" : "Wrong — 0"}</div>
          <button data-testid="hint-target-quint-deal-primary" className="cm-btn alt" onClick={() => dispatch({ type:"next" } as QuintDealAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
