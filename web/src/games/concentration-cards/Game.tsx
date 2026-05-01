import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ConcentrationCardsState, ConcentrationCardsAction, ConcentrationCardsSettings } from "./state.js";
import { isTerminal, PAIR_COUNT, SYMBOL_FACES } from "./state.js";
import "./Game.css";

export function ConcentrationCardsGame({ state, dispatch, onGameOver }: GameProps<ConcentrationCardsState, ConcentrationCardsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  useEffect(() => {
    if (state.flipped.length !== 2) return;
    const id = setTimeout(() => dispatch({ type: "resolve" } as ConcentrationCardsAction), 700);
    return () => clearTimeout(id);
  }, [state.flipped, dispatch]);

  if (state.phase === "done") {
    return (
      <div className="cmem-wrap">
        <div className="cmem-done">
          <h2>Cleared</h2>
          <div className="cmem-stats">{state.matches} pairs in {state.attempts} attempts</div>
          <div className="cmem-final">{state.score} pts</div>
        </div>
      </div>
    );
  }

  return (
    <div className="cmem-wrap">
      <div className="cmem-header">
        <span className="cmem-progress">{state.matches} / {PAIR_COUNT} pairs</span>
        <span className="cmem-attempts">{state.attempts} attempts</span>
        <span className="cmem-score">{state.score} pts</span>
      </div>
      <div className="cmem-board">
        {state.values.map((v, i) => {
          const open = state.revealed[i] || state.flipped.includes(i);
          let cls = "cmem-card";
          if (state.revealed[i]) cls += " matched";
          else if (state.flipped.includes(i)) cls += " flipped";
          return (
            <button key={i} className={cls} disabled={open || state.flipped.length >= 2} onClick={() => dispatch({ type: "flip", index: i } as ConcentrationCardsAction)}>
              <span className="cmem-face">{open ? SYMBOL_FACES[v] : "?"}</span>
            </button>
          );
        })}
      </div>
      <div className="cmem-hint">Flip two cards. Match the symbols. A perfect run earns a bonus.</div>
    </div>
  );
}
