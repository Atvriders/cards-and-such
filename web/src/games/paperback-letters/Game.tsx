import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PaperbackLettersState, PaperbackLettersAction, PaperbackLettersSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, DECK } from "./state.js";
import "./Game.css";
export function PaperbackLettersGame({ state, dispatch, onGameOver }: GameProps<PaperbackLettersState, PaperbackLettersSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>📚 Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">📚 Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="cm-score">{state.score} pts</div>
      {state.hand.length > 0 && (
        <div className="cm-row">
          {state.hand.map((i, k) => <div key={k} className="cm-card loot">{DECK[i]?.name} ({DECK[i]?.value})</div>)}
        </div>
      )}
      {state.phase === "drawing" && (
        <button className="cm-btn" onClick={() => dispatch({ type:"draw" } as PaperbackLettersAction)}>Draw</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="cm-result">+{state.lastPts} pts</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as PaperbackLettersAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
