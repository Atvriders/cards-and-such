import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HomophoneMatchState, HomophoneMatchAction, HomophoneMatchSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./HomophoneMatch.css";

export function HomophoneMatch({
  state,
  dispatch,
  onGameOver,
}: GameProps<HomophoneMatchState, HomophoneMatchSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.wrong) {
      const t = setTimeout(() => {
        dispatch({ type: "clearWrong" } as HomophoneMatchAction);
      }, 800);
      return () => clearTimeout(t);
    }
  }, [state.wrong, dispatch]);

  const { pairs, leftItems, rightItems, selectedLeft, selectedRight, matched, wrong, score, attempts } = state;

  function leftClass(i: number): string {
    const word = leftItems[i]!;
    const pi = pairs.findIndex((p) => p.word === word);
    if (matched.has(pi)) return "hm-cell matched";
    if (wrong && wrong[0] === i) return "hm-cell wrong";
    if (selectedLeft === i) return "hm-cell selected";
    return "hm-cell";
  }

  function rightClass(i: number): string {
    const homophone = rightItems[i]!;
    const pi = pairs.findIndex((p) => p.homophone === homophone);
    if (matched.has(pi)) return "hm-cell matched";
    if (wrong && wrong[1] === i) return "hm-cell wrong";
    if (selectedRight === i) return "hm-cell selected";
    return "hm-cell";
  }

  return (
    <div className="hm-wrap">
      <div className="hm-score">
        Matched: {matched.size} / {pairs.length} &mdash; Score: {score} &mdash; Attempts: {attempts}
      </div>
      <div className="hm-instructions">
        Match each word (left) with its homophone — a word that sounds the same but means something different (right).
      </div>
      <div className="hm-grid">
        <div className="hm-col-header">Words</div>
        <div className="hm-col-header">Homophones</div>
        {leftItems.map((word, i) => {
          const pi = pairs.findIndex((p) => p.word === word);
          return (
            <button
              key={`l-${i}`}
              className={leftClass(i)}
              disabled={matched.has(pi) || !!state.wrong}
              onClick={() => dispatch({ type: "selectLeft", index: i } as HomophoneMatchAction)}
            >
              {word}
            </button>
          );
        })}
        {rightItems.map((homo, i) => {
          const pi = pairs.findIndex((p) => p.homophone === homo);
          return (
            <button
              key={`r-${i}`}
              className={rightClass(i)}
              disabled={matched.has(pi) || !!state.wrong}
              onClick={() => dispatch({ type: "selectRight", index: i } as HomophoneMatchAction)}
            >
              {homo}
            </button>
          );
        })}
      </div>

      {terminal && (
        <div className="hm-overlay">
          <div className="hm-overlay-box">
            <h2>All Matched!</h2>
            <div className="hm-final-score">Score: {terminal.score}</div>
            <div className="hm-final-attempts">Completed in {attempts} attempts</div>
          </div>
        </div>
      )}
    </div>
  );
}
