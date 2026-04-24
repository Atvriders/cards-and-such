import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WheelSpinState, WheelSpinAction, WheelSpinSettings } from "./state.js";
import { isTerminal, isVowel } from "./state.js";
import "./Game.css";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function WheelSpin({ state, dispatch, onGameOver }: GameProps<WheelSpinState, WheelSpinSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [solveInput, setSolveInput] = useState("");

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isDone = state.phase === "won" || state.phase === "lost";
  const roundDone = isDone && state.round < state.totalRounds;

  if (terminal && isDone) {
    return (
      <div className="ws-wrap">
        <div className="ws-done">
          <h2>Game Over!</h2>
          <p>Rounds completed: {state.round} / {state.totalRounds}</p>
          <div className="ws-final-score">{state.score} pts</div>
        </div>
      </div>
    );
  }

  const tiles = state.puzzle.word.split("").map((ch, i) => (
    <div key={i} className={`ws-tile ${state.revealed[i] ? "revealed" : "hidden"}`}>
      {state.revealed[i] ? ch : ""}
    </div>
  ));

  return (
    <div className="ws-wrap">
      <div className="ws-header">
        <span>Round {state.round} / {state.totalRounds}</span>
        <span className="ws-category">{state.puzzle.category}</span>
        <span className="ws-score">{state.score} pts</span>
      </div>

      <div className="ws-board">{tiles}</div>

      <div className="ws-wrong">Wrong guesses: {state.wrongGuesses} / {state.maxWrong}</div>

      {state.spinValue && state.phase === "guessing" && (
        <div className="ws-spin-value">Spin: ${state.spinValue}</div>
      )}

      {state.lastGuessCorrect !== null && (
        <div className={`ws-feedback ${state.lastGuessCorrect ? "good" : "bad"}`}>
          {state.lastGuessCorrect ? "Correct! Letter found!" : "Not in puzzle — spin again."}
        </div>
      )}

      {isDone && (
        <div className={`ws-feedback ${state.phase === "won" ? "good" : "bad"}`}>
          {state.phase === "won" ? `You solved it: ${state.puzzle.word}!` : `Puzzle was: ${state.puzzle.word}`}
        </div>
      )}

      {!isDone && (
        <>
          <div className="ws-actions">
            <button
              className="ws-btn spin"
              disabled={state.phase !== "spinning"}
              onClick={() => dispatch({ type: "spin" } as WheelSpinAction)}
            >
              Spin Wheel
            </button>
            <button
              className="ws-btn vowel"
              disabled={state.phase !== "spinning" || state.score < 250}
              onClick={() => dispatch({ type: "buy_vowel", letter: "" } as unknown as WheelSpinAction)}
            >
              Buy Vowel ($250)
            </button>
          </div>

          {state.phase === "guessing" && (
            <div className="ws-keyboard">
              {ALPHABET.filter(l => !isVowel(l)).map(l => (
                <button
                  key={l}
                  className="ws-key"
                  disabled={state.guessedLetters.includes(l)}
                  onClick={() => dispatch({ type: "guess_consonant", letter: l } as WheelSpinAction)}
                >
                  {l}
                </button>
              ))}
            </div>
          )}

          {state.phase === "spinning" && (
            <>
              <div className="ws-keyboard">
                {ALPHABET.filter(l => isVowel(l)).map(l => (
                  <button
                    key={l}
                    className="ws-key vowel"
                    disabled={state.guessedLetters.includes(l) || state.score < 250}
                    onClick={() => dispatch({ type: "buy_vowel", letter: l } as WheelSpinAction)}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <div className="ws-solve-row">
                <input
                  className="ws-solve-input"
                  placeholder="Solve the puzzle…"
                  value={solveInput}
                  onChange={e => setSolveInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && solveInput.trim()) {
                      dispatch({ type: "solve", word: solveInput } as WheelSpinAction);
                      setSolveInput("");
                    }
                  }}
                />
                <button
                  className="ws-btn vowel"
                  disabled={!solveInput.trim()}
                  onClick={() => {
                    dispatch({ type: "solve", word: solveInput } as WheelSpinAction);
                    setSolveInput("");
                  }}
                >
                  Solve
                </button>
              </div>
            </>
          )}
        </>
      )}

      {roundDone && (
        <button
          className="ws-btn next"
          onClick={() => dispatch({ type: "next_round" } as WheelSpinAction)}
        >
          Next Round
        </button>
      )}
    </div>
  );
}
