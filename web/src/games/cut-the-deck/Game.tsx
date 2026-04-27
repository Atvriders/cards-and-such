import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CutTheDeckState, CutTheDeckAction, CutTheDeckSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function CutTheDeckGame({ state, dispatch, onGameOver }: GameProps<CutTheDeckState, CutTheDeckSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="cm-score">{state.score} pts</div>
      {state.card !== null && (
        <div className={`cm-card ${isRed(state.card) ? "red" : "black"}`}>{cardName(state.card)}</div>
      )}
      {state.phase === "predict" && (
        <div className="cm-row">
          <button className="cm-btn" onClick={() => dispatch({ type:"predict", choice:"under" } as CutTheDeckAction)}>Under 7</button>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"predict", choice:"over" } as CutTheDeckAction)}>Over 7</button>
        </div>
      )}
      {state.phase === "result" && (
        <>
          <div className="cm-result">{state.push ? "Push (rank = 7) — 0" : state.lastWin ? "Correct! +10" : "Wrong — 0"}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as CutTheDeckAction)}>Next</button>
        </>
      )}
    </div>
  );
}
