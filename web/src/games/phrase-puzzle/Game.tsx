import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PhrasePuzzleState, PhrasePuzzleAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

type PuzzleSettings = Record<string, never>;

export function PhrasePuzzle({ state, dispatch, onGameOver }: GameProps<PhrasePuzzleState, PuzzleSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "done") {
    const solved = state.solved.filter(Boolean).length;
    return (
      <div className="phrasepuzzle-wrap">
        <div className="phrasepuzzle-title">Phrase Puzzle</div>
        <div className="phrasepuzzle-done">
          <h2>Complete!</h2>
          <p>Solved {solved} of {state.puzzles.length} phrases</p>
          <p style={{ fontWeight: 900, fontSize: "1.5rem", color: "#27ae60" }}>Score: {state.score}</p>
        </div>
      </div>
    );
  }

  const puzzle = state.puzzles[state.current]!;
  const blanks = state.blankIndexes[state.current]!;
  const isCorrect = state.checked && state.solved[state.current];
  const isWrong = state.checked && !state.solved[state.current];

  // Render phrase with blanks
  const words = puzzle.blankedPhrase.split(" ");
  let phraseIdx = 0;
  let blankCount = 0;

  const rendered = words.map((word, wi) => {
    const letters = word.split("").map((ch, li) => {
      const absIdx = phraseIdx + li;
      if (ch === "_") {
        const blankPos = blankCount++;
        const correctChar = puzzle.phrase[absIdx] ?? "";
        const playerChar = state.inputs[blankPos] ?? "";
        let cls = "pp-blank";
        if (state.checked) cls += isCorrect ? " correct" : " wrong";
        return (
          <input
            key={li}
            className={cls}
            type="text"
            maxLength={1}
            value={state.checked ? correctChar : playerChar}
            readOnly={state.checked}
            onChange={e => {
              const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);
              dispatch({ type: "type", puzzleIdx: state.current, blankPos, char: val } as PhrasePuzzleAction);
            }}
          />
        );
      } else {
        return <span key={li} className="pp-letter">{ch}</span>;
      }
    });
    phraseIdx += word.length + 1;
    return <span key={wi} className="pp-word">{letters}</span>;
  });

  return (
    <div className="phrasepuzzle-wrap">
      <div className="phrasepuzzle-title">Phrase Puzzle</div>
      <div className="phrasepuzzle-progress">Phrase {state.current + 1} of {state.puzzles.length}</div>
      <div className="phrasepuzzle-score">Score: {state.score}</div>
      <div className="phrasepuzzle-card">
        <div className="phrasepuzzle-category">{puzzle.category}</div>
        <div className="phrasepuzzle-hint">"{puzzle.hint}"</div>
        <div className="phrasepuzzle-phrase">{rendered}</div>
      </div>
      <div className={`phrasepuzzle-message${isWrong ? " bad" : ""}`}>{state.message}</div>
      <div className="phrasepuzzle-btns">
        {!state.checked ? (
          <button className="phrasepuzzle-btn" onClick={() => dispatch({ type: "check" } as PhrasePuzzleAction)}>
            Check
          </button>
        ) : (
          <button className="phrasepuzzle-btn next" onClick={() => dispatch({ type: "next" } as PhrasePuzzleAction)}>
            {state.current + 1 < state.puzzles.length ? "Next →" : "Finish"}
          </button>
        )}
      </div>
    </div>
  );
}
