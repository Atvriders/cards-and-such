import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PelmanismState, PelmanismAction, PelmanismSettings } from "./state.js";
import { isTerminal, PAIR_COUNT, PELMANISM_FACES } from "./state.js";
import "./Game.css";

export function PelmanismGame({ state, dispatch, onGameOver }: GameProps<PelmanismState, PelmanismSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  useEffect(() => {
    if (state.flipped.length !== 2) return;
    const id = setTimeout(() => dispatch({ type: "resolve" } as PelmanismAction), 700);
    return () => clearTimeout(id);
  }, [state.flipped, dispatch]);

  if (state.phase === "done") {
    return (
      <div className="pelman-wrap">
        <div className="pelman-done">
          <h2>Cleared</h2>
          <div className="pelman-stats">{state.matches} pairs in {state.attempts} attempts</div>
          <div className="pelman-final">{state.score} pts</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pelman-wrap">
      <div className="pelman-header">
        <span className="pelman-progress">{state.matches} / {PAIR_COUNT} pairs</span>
        <span className="pelman-attempts">{state.attempts} attempts</span>
        <span className="pelman-score">{state.score} pts</span>
      </div>
      <div className="pelman-board">
        {state.values.map((v, i) => {
          const open = state.revealed[i] || state.flipped.includes(i);
          let cls = "pelman-card";
          if (state.revealed[i]) cls += " matched";
          else if (state.flipped.includes(i)) cls += " flipped";
          return (
            <button data-testid={`hint-target-pelmanism-card-${i}`} key={i} className={cls} disabled={open || state.flipped.length >= 2} onClick={() => dispatch({ type: "flip", index: i } as PelmanismAction)}>
              <span className="pelman-face">{open ? PELMANISM_FACES[v] : ""}</span>
            </button>
          );
        })}
      </div>
      <div className="pelman-hint">Pair the symbols. Perfect run yields a bonus.</div>
    </div>
  );
}
