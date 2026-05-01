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
      <div className="pelm-wrap">
        <div className="pelm-done">
          <h2>Cleared</h2>
          <div className="pelm-stats">{state.matches} pairs in {state.attempts} attempts</div>
          <div className="pelm-final">{state.score} pts</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pelm-wrap">
      <div className="pelm-header">
        <span className="pelm-progress">{state.matches} / {PAIR_COUNT} pairs</span>
        <span className="pelm-attempts">{state.attempts} attempts</span>
        <span className="pelm-score">{state.score} pts</span>
      </div>
      <div className="pelm-board">
        {state.values.map((v, i) => {
          const open = state.revealed[i] || state.flipped.includes(i);
          let cls = "pelm-card";
          if (state.revealed[i]) cls += " matched";
          else if (state.flipped.includes(i)) cls += " flipped";
          return (
            <button key={i} className={cls} disabled={open || state.flipped.length >= 2} onClick={() => dispatch({ type: "flip", index: i } as PelmanismAction)}>
              <span className="pelm-face">{open ? PELMANISM_FACES[v] : ""}</span>
            </button>
          );
        })}
      </div>
      <div className="pelm-hint">Pair the symbols. Perfect run yields a bonus.</div>
    </div>
  );
}
