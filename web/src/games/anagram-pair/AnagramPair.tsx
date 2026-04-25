import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AnagramPairState, AnagramPairAction, AnagramPairSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./AnagramPair.css";

export function AnagramPair({
  state,
  dispatch,
  onGameOver,
}: GameProps<AnagramPairState, AnagramPairSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.wrong) {
      const t = setTimeout(() => {
        dispatch({ type: "clearWrong" } as AnagramPairAction);
      }, 800);
      return () => clearTimeout(t);
    }
  }, [state.wrong, dispatch]);

  const { pairs, leftItems, rightItems, selectedLeft, selectedRight, matched, wrong, score, attempts } = state;

  function leftClass(i: number): string {
    const word = leftItems[i]!;
    const pi = pairs.findIndex((p) => p.word === word);
    if (matched.has(pi)) return "ap-cell matched";
    if (wrong && wrong[0] === i) return "ap-cell wrong";
    if (selectedLeft === i) return "ap-cell selected";
    return "ap-cell";
  }

  function rightClass(i: number): string {
    const anagram = rightItems[i]!;
    const pi = pairs.findIndex((p) => p.anagram === anagram);
    if (matched.has(pi)) return "ap-cell matched";
    if (wrong && wrong[1] === i) return "ap-cell wrong";
    if (selectedRight === i) return "ap-cell selected";
    return "ap-cell";
  }

  return (
    <div className="ap-wrap">
      <div className="ap-score">
        Matched: {matched.size} / {pairs.length} &mdash; Score: {score} &mdash; Attempts: {attempts}
      </div>
      <div className="ap-instructions">
        Match each word (left) with its anagram — a word using the same letters in a different order (right).
      </div>
      <div className="ap-grid">
        <div className="ap-col-header">Words</div>
        <div className="ap-col-header">Anagrams</div>
        {leftItems.map((word, i) => {
          const pi = pairs.findIndex((p) => p.word === word);
          return (
            <button
              key={`l-${i}`}
              className={leftClass(i)}
              disabled={matched.has(pi) || !!state.wrong}
              onClick={() => dispatch({ type: "selectLeft", index: i } as AnagramPairAction)}
            >
              {word}
            </button>
          );
        })}
        {rightItems.map((anagram, i) => {
          const pi = pairs.findIndex((p) => p.anagram === anagram);
          return (
            <button
              key={`r-${i}`}
              className={rightClass(i)}
              disabled={matched.has(pi) || !!state.wrong}
              onClick={() => dispatch({ type: "selectRight", index: i } as AnagramPairAction)}
            >
              {anagram}
            </button>
          );
        })}
      </div>

      {terminal && (
        <div className="ap-overlay">
          <div className="ap-overlay-box">
            <h2>All Matched!</h2>
            <div className="ap-final-score">Score: {terminal.score}</div>
            <div className="ap-final-attempts">Completed in {attempts} attempts</div>
          </div>
        </div>
      )}
    </div>
  );
}
