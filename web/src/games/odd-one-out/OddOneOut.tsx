import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { OddOneOutState, OddOneOutSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./OddOneOut.css";

export function OddOneOut({
  state,
  dispatch,
  onGameOver,
}: GameProps<OddOneOutState, OddOneOutSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { currentPuzzle, isRevealed, selectedIndex } = state;

  function itemClass(i: number): string {
    if (!isRevealed) return "ooo-item";
    if (i === currentPuzzle.oddIndex) return "ooo-item correct-odd";
    if (i === selectedIndex && i !== currentPuzzle.oddIndex) return "ooo-item wrong-pick";
    return "ooo-item normal-reveal";
  }

  const isCorrect = selectedIndex === currentPuzzle.oddIndex;

  return (
    <div className="odd-one-out">
      {state.phase === "done" ? (
        <div className="ooo-done">
          Done! {state.correct}/{state.totalRounds} correct
          <br />Score: {state.correct * 5}
        </div>
      ) : (
        <>
          <div className="ooo-progress">
            Round {state.roundNumber} / {state.totalRounds} · ✓{state.correct} ✗{state.wrong}
          </div>

          <div className="ooo-prompt">Which one doesn't belong?</div>

          <div className="ooo-items">
            {currentPuzzle.items.map((item, i) => (
              <button
                key={i}
                className={itemClass(i)}
                onClick={() => dispatch({ type: "select", index: i })}
                disabled={isRevealed}
              >
                {item}
              </button>
            ))}
          </div>

          {isRevealed && (
            <>
              <div className={`ooo-feedback${isCorrect ? " correct" : " wrong"}`}>
                {isCorrect ? "Correct! 🎉" : `Wrong — the odd one was "${currentPuzzle.items[currentPuzzle.oddIndex]}"`}
              </div>
              <div className="ooo-explanation">{currentPuzzle.explanation}</div>
              <button className="ooo-next-btn" onClick={() => dispatch({ type: "next" })}>
                {state.roundNumber >= state.totalRounds ? "Finish" : "Next Puzzle →"}
              </button>
            </>
          )}

          <div className="ooo-stats">
            <span>🔥 Streak: {state.streak}</span>
            <span>Score: {state.correct * 5}</span>
          </div>
        </>
      )}
    </div>
  );
}
