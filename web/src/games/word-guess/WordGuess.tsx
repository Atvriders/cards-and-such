import { useEffect, useCallback, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WordGuessState, WordGuessAction, LetterState } from "./state.js";
import { isTerminal } from "./state.js";
import type { WordGuessSettings } from "./state.js";
import "./WordGuess.css";

// QWERTY rows for on-screen keyboard
const KB_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

/** Priority order: green > yellow > gray > unknown */
const STATE_PRIORITY: Record<LetterState | "unknown", number> = {
  green: 3,
  yellow: 2,
  gray: 1,
  unknown: 0,
};

function buildLetterStates(attempts: WordGuessState["attempts"]): Record<string, LetterState> {
  const map: Record<string, LetterState> = {};
  for (const attempt of attempts) {
    for (let i = 0; i < attempt.guess.length; i++) {
      const ch = attempt.guess[i]!;
      const mark = attempt.marks[i]!;
      const existing = map[ch] ?? ("unknown" as const);
      if (STATE_PRIORITY[mark] > STATE_PRIORITY[existing]) {
        map[ch] = mark;
      }
    }
  }
  return map;
}

export function WordGuess({
  state,
  dispatch,
  onGameOver,
}: GameProps<WordGuessState, WordGuessSettings>): JSX.Element {
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);
  const terminal = isTerminal(state);

  const handleKey = useCallback(
    (key: string) => {
      if (terminal) return;
      if (key === "Enter") {
        dispatch({ type: "submit" } as WordGuessAction);
      } else if (key === "Backspace" || key === "⌫") {
        dispatch({ type: "backspace" } as WordGuessAction);
      } else {
        const upper = key.toUpperCase();
        if (/^[A-Z]$/.test(upper)) {
          dispatch({ type: "letter", char: upper } as WordGuessAction);
        }
      }
    },
    [dispatch, terminal],
  );

  // Physical keyboard listener
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      handleKey(e.key === "Enter" ? "Enter" : e.key);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey]);

  const letterStates = buildLetterStates(state.attempts);
  const { wordLength, maxAttempts, attempts, current } = state;

  // Build rows to render
  const rows: Array<{ letters: string[]; marks: Array<LetterState | null> }> = [];

  // Submitted attempts
  for (const attempt of attempts) {
    rows.push({
      letters: attempt.guess.split(""),
      marks: [...attempt.marks],
    });
  }

  // Current row (in progress) — only if not terminal
  if (!state.won && !state.lost) {
    const currentLetters = current.split("");
    while (currentLetters.length < wordLength) currentLetters.push("");
    rows.push({ letters: currentLetters, marks: Array(wordLength).fill(null) });
  }

  // Empty rows
  while (rows.length < maxAttempts) {
    rows.push({ letters: Array(wordLength).fill(""), marks: Array(wordLength).fill(null) });
  }

  return (
    <div className="word-guess">
      <div className="word-guess__overlay-wrap">
        <div className="word-guess__grid">
          {rows.map((row, ri) => (
            <div key={ri} className="word-guess__row">
              {row.letters.map((letter, ci) => {
                const mark = row.marks[ci];
                let cls = "word-guess__tile";
                if (mark === "green") cls += " word-guess__tile--green";
                else if (mark === "yellow") cls += " word-guess__tile--yellow";
                else if (mark === "gray") cls += " word-guess__tile--gray";
                else if (letter) cls += " word-guess__tile--filled";
                return (
                  <div key={ci} className={cls}>
                    {letter}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {terminal && (
          <div className="word-guess__overlay">
            {state.won ? (
              <>
                <h2>You got it!</h2>
                <p>Score: {terminal.score}</p>
              </>
            ) : (
              <>
                <h2>Better luck next time</h2>
                <p>
                  It was: <strong>{state.target}</strong>
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="word-guess__error">{state.error ?? ""}</div>

      <div className="word-guess__keyboard">
        {KB_ROWS.map((row, ri) => (
          <div key={ri} className="word-guess__kb-row">
            {row.map((key) => {
              const isWide = key === "ENTER" || key === "⌫";
              const letterState = key.length === 1 ? letterStates[key] : undefined;
              let cls = "word-guess__kb-key";
              if (isWide) cls += " word-guess__kb-key--wide";
              if (letterState === "green") cls += " word-guess__kb-key--green";
              else if (letterState === "yellow") cls += " word-guess__kb-key--yellow";
              else if (letterState === "gray") cls += " word-guess__kb-key--gray";
              return (
                <button
                  key={key}
                  className={cls}
                  onClick={() =>
                    handleKey(key === "ENTER" ? "Enter" : key === "⌫" ? "Backspace" : key)
                  }
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
