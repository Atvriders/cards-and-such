import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WordPyramidState, WordPyramidAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

type PyramidSettings = Record<string, never>;

export function WordPyramid({ state, dispatch, onGameOver }: GameProps<WordPyramidState, PyramidSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { puzzle, inputs, revealed, checked } = state;

  if (state.phase === "done") {
    return (
      <div className="pyramid-wrap">
        <div className="pyramid-title">Word Pyramid</div>
        <div className="pyramid-done">
          <h2>Complete!</h2>
          <p style={{ fontWeight: 900, fontSize: "1.5rem", color: "#27ae60" }}>Score: {state.score}</p>
          <p>{state.message}</p>
        </div>
        <div className="pyramid-grid">
          {puzzle.levels.map((level, i) => (
            <div key={i} className="pyramid-row">
              <div className="pyramid-cells">
                {level.word.split("").map((ch, j) => (
                  <div key={j} className={`pyramid-cell ${inputs[i] === level.word || revealed[i] ? "correct" : "wrong"}`}>{ch}</div>
                ))}
              </div>
              <span className="pyramid-clue">{level.clue}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pyramid-wrap">
      <div className="pyramid-title">Word Pyramid</div>
      <p style={{ fontSize: "0.85rem", color: "#7f8c8d", textAlign: "center" }}>
        Each row adds one letter — all letters of the previous row are still used (rearranged).
      </p>
      <div className="pyramid-grid">
        {puzzle.levels.map((level, i) => {
          const isRevealed = revealed[i];
          const isCorrect = checked && inputs[i] === level.word;
          const isWrong = checked && inputs[i] !== level.word && !isRevealed;
          return (
            <div key={i} className="pyramid-row">
              <div className="pyramid-cells">
                {level.word.split("").map((ch, j) => {
                  const playerCh = inputs[i]?.[j] ?? "";
                  const displayCh = isRevealed ? ch : playerCh;
                  let cls = "pyramid-cell";
                  if (isCorrect || isRevealed) cls += " correct";
                  else if (isWrong && playerCh) cls += " wrong";
                  return <div key={j} className={cls}>{displayCh}</div>;
                })}
              </div>
              {!isRevealed ? (
                <input
                  className="pyramid-input"
                  type="text"
                  maxLength={level.word.length}
                  value={inputs[i] ?? ""}
                  placeholder={`${level.word.length} letters`}
                  onChange={e => dispatch({ type: "type", row: i, text: e.target.value } as WordPyramidAction)}
                />
              ) : (
                <span style={{ width: 108, fontWeight: 700, color: "#27ae60" }}>{level.word}</span>
              )}
              <span className="pyramid-clue">{level.clue}</span>
              {!isRevealed && !checked && (
                <button className="pyramid-reveal-btn" onClick={() => dispatch({ type: "reveal", row: i } as WordPyramidAction)}>
                  Reveal
                </button>
              )}
            </div>
          );
        })}
      </div>
      <button className="pyramid-check-btn" onClick={() => dispatch({ type: "check" } as WordPyramidAction)}>
        Check Answers
      </button>
      <div className="pyramid-message">{state.message}</div>
    </div>
  );
}
