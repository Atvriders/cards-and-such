import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HotTakeState, HotTakeAction, HotTakeSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function HotTake({ state, dispatch, onGameOver }: GameProps<HotTakeState, HotTakeSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  if (state.phase === "done") {
    const total = state.agreeCount + state.disagreeCount;
    return (
      <div className="ht-wrap">
        <div className="ht-done">
          <h2>All Takes Served!</h2>
          <p>Agreed: <strong>{state.agreeCount}</strong> | Disagreed: <strong>{state.disagreeCount}</strong></p>
          {total > 0 && <p>You agreed with {Math.round((state.agreeCount / total) * 100)}% of takes!</p>}
        </div>
      </div>
    );
  }

  const take = state.takes[state.currentIndex]!;

  return (
    <div className="ht-wrap">
      <div className="ht-header">
        <span>Take {state.currentIndex + 1} / {state.takes.length}</span>
        <div className="ht-tally">
          <span className="ht-agree-count">Agree: {state.agreeCount}</span>
          <span className="ht-disagree-count">Disagree: {state.disagreeCount}</span>
        </div>
      </div>
      <div className="ht-card">
        <span className="ht-badge">Hot Take</span>
        {take}
      </div>
      <div className="ht-buttons">
        <button className="ht-btn-agree" onClick={() => dispatch({ type: "agree" } as HotTakeAction)}>
          Agree
        </button>
        <button className="ht-btn-disagree" onClick={() => dispatch({ type: "disagree" } as HotTakeAction)}>
          Disagree
        </button>
      </div>
      <button className="ht-btn-skip" onClick={() => dispatch({ type: "skip" } as HotTakeAction)}>
        Skip (no opinion)
      </button>
    </div>
  );
}
