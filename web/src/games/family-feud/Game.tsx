import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FamilyFeudState, FamilyFeudAction, FamilyFeudSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function FamilyFeud({ state, dispatch, onGameOver }: GameProps<FamilyFeudState, FamilyFeudSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.phase === "guessing") inputRef.current?.focus();
  }, [state.phase, state.questionIndex]);

  if (state.phase === "done") {
    return (
      <div className="ff-wrap">
        <div className="ff-done">
          <h2>Game Over!</h2>
          <p>You finished all {state.questions.length} questions.</p>
          <div className="ff-done-score">{state.score} pts</div>
        </div>
      </div>
    );
  }

  const q = state.questions[state.questionIndex]!;

  return (
    <div className="ff-wrap">
      <div className="ff-header">
        <span className="ff-title">Survey Says!</span>
        <span className="ff-score-box">{state.score} pts</span>
      </div>

      <div className="ff-progress">Question {state.questionIndex + 1} of {state.questions.length}</div>

      <div className="ff-prompt">{q.prompt}</div>

      <div className="ff-slots">
        {q.slots.map((sl, i) => (
          <div key={i} className={`ff-slot ${sl.revealed ? "revealed" : ""}`}>
            <div className="ff-slot-num">{i + 1}</div>
            <div className="ff-slot-answer">
              {sl.revealed ? sl.answer.toUpperCase() : "???"}
            </div>
            {sl.revealed && <div className="ff-slot-pts">{sl.points} pts</div>}
          </div>
        ))}
      </div>

      <div className="ff-strikes">
        {[0, 1, 2].map(i => (
          <span key={i} className={i < state.strikes ? "ff-strike-active" : "ff-strike-empty"}>
            ✗
          </span>
        ))}
      </div>

      {state.lastGuessResult && (
        <div className={`ff-feedback ${state.lastGuessResult}`}>
          {state.lastGuessResult === "correct" && `"${state.lastGuess}" — CORRECT!`}
          {state.lastGuessResult === "wrong" && `"${state.lastGuess}" — not on the board.`}
          {state.lastGuessResult === "duplicate" && `"${state.lastGuess}" — already revealed.`}
        </div>
      )}

      {state.phase === "guessing" && (
        <div className="ff-input-row">
          <input
            ref={inputRef}
            className="ff-input"
            placeholder="Type your answer…"
            value={state.inputValue}
            onChange={e => dispatch({ type: "set_input", value: e.target.value } as FamilyFeudAction)}
            onKeyDown={e => { if (e.key === "Enter") dispatch({ type: "submit_guess" } as FamilyFeudAction); }}
          />
          <button
            className="ff-btn"
            disabled={!state.inputValue.trim()}
            onClick={() => dispatch({ type: "submit_guess" } as FamilyFeudAction)}
          >
            Guess
          </button>
        </div>
      )}

      {state.phase === "round_end" && (
        <div className="ff-round-end">
          <p>
            {state.strikes >= 3
              ? "3 strikes! Moving to next question."
              : "All answers revealed!"}
          </p>
          <div style={{ marginTop: 8, marginBottom: 12 }}>
            {q.slots.map((sl, i) => (
              <div key={i} style={{ color: sl.revealed ? "#1e8449" : "#c0392b", fontSize: "0.9rem" }}>
                {sl.answer.toUpperCase()} ({sl.points} pts){sl.revealed ? " ✓" : " ✗"}
              </div>
            ))}
          </div>
          <button
            className="ff-btn next"
            onClick={() => dispatch({ type: "next_question" } as FamilyFeudAction)}
          >
            {state.questionIndex + 1 >= state.questions.length ? "See Final Score" : "Next Question"}
          </button>
        </div>
      )}
    </div>
  );
}
