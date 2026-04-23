import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QuordleState, QuordleAction, QuordleSettings, LetterResult, GuessResult } from "./state.js";
import { isTerminal } from "./state.js";
import "./Quordle.css";

const ROWS = 9;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function Grid({ results, target, solved, currentInput, isActive }: {
  results: GuessResult[];
  target: string;
  solved: boolean;
  currentInput: string;
  isActive: boolean;
}): JSX.Element {
  return (
    <div className={`qr-grid${solved ? " qr-grid-solved" : ""}`}>
      {Array.from({ length: ROWS }, (_, row) => {
        const guess = results[row];
        const isCurrent = !guess && isActive && row === results.length;
        const displayWord = isCurrent ? currentInput.padEnd(5) : (guess?.word ?? "     ");
        return (
          <div key={row} className="qr-grid-row">
            {Array.from({ length: 5 }, (_, col) => {
              const letter = displayWord[col] ?? " ";
              const res: LetterResult | undefined = guess?.results[col];
              let cls = "qr-cell";
              if (res === "correct") cls += " qr-correct";
              else if (res === "present") cls += " qr-present";
              else if (res === "absent" && guess) cls += " qr-absent";
              else if (isCurrent && letter.trim()) cls += " qr-typing";
              return (
                <div key={col} className={cls}>{letter.trim()}</div>
              );
            })}
          </div>
        );
      })}
      {solved && <div className="qr-solved-label">{target} ✓</div>}
    </div>
  );
}

function Keyboard({ guesses, targets }: { guesses: GuessResult[]; targets: readonly string[] }): JSX.Element {
  // Compute best color per letter across all grids
  const colorMap: Record<string, LetterResult> = {};
  for (const target of targets) {
    for (const g of guesses) {
      for (let i = 0; i < 5; i++) {
        const ch = g.word[i]!;
        const res = g.results[i]!;
        // Score: correct > present > absent
        const prev = colorMap[ch];
        if (!prev || (prev === "absent" && res !== "absent") || (prev === "present" && res === "correct")) {
          // Re-score based on this target
          void target;
          colorMap[ch] = res;
        }
      }
    }
  }

  const rows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
  return (
    <div className="qr-keyboard">
      {rows.map((row, ri) => (
        <div key={ri} className="qr-kb-row">
          {row.split("").map(l => {
            const c = colorMap[l];
            return (
              <div key={l} className={`qr-kb-key${c === "correct" ? " qr-correct" : c === "present" ? " qr-present" : c === "absent" ? " qr-absent" : ""}`}>
                {l}
              </div>
            );
          })}
        </div>
      ))}
      {void ALPHABET}
    </div>
  );
}

export function Quordle({
  state,
  dispatch,
  onGameOver,
}: GameProps<QuordleState, QuordleSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (state.gameOver) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Enter") dispatch({ type: "submit" } as QuordleAction);
    else if (e.key === "Backspace") dispatch({ type: "delete" } as QuordleAction);
    else if (/^[a-zA-Z]$/.test(e.key)) dispatch({ type: "type", char: e.key } as QuordleAction);
  }, [state.gameOver, dispatch]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const { targets, gridResults, currentInput, guesses, solved, message, gameOver } = state;
  const guessesLeft = 9 - guesses.length;
  const solvedCount = solved.filter(Boolean).length;

  return (
    <div className="qr-wrap">
      <div className="qr-header">
        <span>Guesses left: {guessesLeft} / 9</span>
        <span>Solved: {solvedCount} / 4</span>
      </div>

      {message && <div className="qr-message">{message}</div>}

      <div className="qr-input-display">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className={`qr-input-cell${currentInput[i] ? " qr-typing" : ""}`}>
            {currentInput[i] ?? ""}
          </div>
        ))}
      </div>

      <div className="qr-grids">
        {([0, 1, 2, 3] as const).map(gi => (
          <Grid
            key={gi}
            results={gridResults[gi] ?? []}
            target={targets[gi]}
            solved={solved[gi]}
            currentInput={currentInput}
            isActive={!solved[gi]}
          />
        ))}
      </div>

      <div className="qr-controls">
        <button onClick={() => dispatch({ type: "delete" } as QuordleAction)}>⌫</button>
        <button className="qr-enter" onClick={() => dispatch({ type: "submit" } as QuordleAction)}>ENTER</button>
      </div>

      <Keyboard guesses={guesses} targets={targets} />

      {gameOver && (
        <div className="qr-overlay">
          <div className="qr-overlay-box">
            <h2>{solvedCount === 4 ? "Brilliant!" : "Game Over"}</h2>
            <div>Solved: {solvedCount} / 4</div>
            <div>Guesses used: {guesses.length}</div>
            {!solved[0] && <div>1: {targets[0]}</div>}
            {!solved[1] && <div>2: {targets[1]}</div>}
            {!solved[2] && <div>3: {targets[2]}</div>}
            {!solved[3] && <div>4: {targets[3]}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
