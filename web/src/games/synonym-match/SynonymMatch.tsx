import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SynonymMatchState, SynonymMatchAction, SynonymMatchSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./SynonymMatch.css";

export function SynonymMatch({
  state,
  dispatch,
  onGameOver,
}: GameProps<SynonymMatchState, SynonymMatchSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  // Auto-clear wrong highlight after a brief delay
  useEffect(() => {
    if (state.wrong) {
      const timer = setTimeout(() => {
        dispatch({ type: "clearWrong" } as SynonymMatchAction);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [state.wrong, dispatch]);

  const handleLeft = useCallback((index: number) => {
    dispatch({ type: "selectLeft", index } as SynonymMatchAction);
  }, [dispatch]);

  const handleRight = useCallback((index: number) => {
    dispatch({ type: "selectRight", index } as SynonymMatchAction);
  }, [dispatch]);

  const { pairs, leftItems, rightItems, selectedLeft, selectedRight, matched, wrong, score, attempts } = state;

  function leftClass(i: number): string {
    const word = leftItems[i]!;
    const pairIdx = pairs.findIndex(p => p.word === word);
    if (matched.has(pairIdx)) return "sm-cell matched";
    if (wrong && wrong[0] === i) return "sm-cell wrong";
    if (selectedLeft === i) return "sm-cell selected";
    return "sm-cell";
  }

  function rightClass(i: number): string {
    const synonym = rightItems[i]!;
    const pairIdx = pairs.findIndex(p => p.synonym === synonym);
    if (matched.has(pairIdx)) return "sm-cell matched";
    if (wrong && wrong[1] === i) return "sm-cell wrong";
    if (selectedRight === i) return "sm-cell selected";
    return "sm-cell";
  }

  return (
    <div className="sm-wrap">
      <div className="sm-score">
        Matched: {matched.size} / {pairs.length} &mdash; Score: {score} &mdash; Attempts: {attempts}
      </div>

      <div className="sm-instructions">
        Select a word on the left, then its synonym on the right.
      </div>

      <div className="sm-grid">
        <div className="sm-column-header">Words</div>
        <div className="sm-column-header">Synonyms</div>
        {leftItems.map((word, i) => {
          const pairIdx = pairs.findIndex(p => p.word === word);
          return (
            <button
              key={`l-${i}`}
              className={leftClass(i)}
              disabled={matched.has(pairIdx) || !!state.wrong}
              onClick={() => handleLeft(i)}
            >
              {word}
            </button>
          );
        })}
        {rightItems.map((syn, i) => {
          const pairIdx = pairs.findIndex(p => p.synonym === syn);
          return (
            <button
              key={`r-${i}`}
              className={rightClass(i)}
              disabled={matched.has(pairIdx) || !!state.wrong}
              onClick={() => handleRight(i)}
            >
              {syn}
            </button>
          );
        })}
      </div>

      {terminal && (
        <div className="sm-overlay">
          <div className="sm-overlay-box">
            <h2>All Matched!</h2>
            <div className="sm-final-score">Score: {terminal.score}</div>
            <div className="sm-final-attempts">Completed in {attempts} attempts</div>
          </div>
        </div>
      )}
    </div>
  );
}
