import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WordLadderState, WordLadderSettings, WordLadderAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./WordLadder.css";

export function WordLadder({
  state,
  dispatch,
  onGameOver,
}: GameProps<WordLadderState, WordLadderSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (terminal) return;
      if (e.key === "Enter") dispatch({ type: "submit" } as WordLadderAction);
      else if (e.key === "Backspace") dispatch({ type: "backspace" } as WordLadderAction);
      else if (/^[a-zA-Z]$/.test(e.key)) dispatch({ type: "letter", char: e.key } as WordLadderAction);
    },
    [dispatch, terminal],
  );

  const movesUsed = state.history.length - 1;
  const movesLeft = state.maxMoves - movesUsed;

  return (
    <div className="word-ladder" tabIndex={0} onKeyDown={handleKey} style={{ outline: "none" }}>
      <div className="word-ladder-header">
        <div style={{ textAlign: "center" }}>
          <div className="word-ladder-label">Start</div>
          <div className="word-ladder-word">{state.start}</div>
        </div>
        <div style={{ fontSize: "1.5rem", color: "#9ca3af" }}>→</div>
        <div style={{ textAlign: "center" }}>
          <div className="word-ladder-label">Target</div>
          <div className="word-ladder-word target">{state.target}</div>
        </div>
      </div>

      <div className="word-ladder-moves">
        Moves used: {movesUsed} / {state.maxMoves} (max)
      </div>

      <div className="word-ladder-chain">
        {state.history.map((word, i) => (
          <div key={`${word}-${i}`} className={`word-ladder-step ${i === 0 ? "start" : state.won && i === state.history.length - 1 ? "won-step" : "middle"}`}>
            {i > 0 && <span className="word-ladder-arrow">↓</span>}
            <span>{word}</span>
          </div>
        ))}
      </div>

      {!state.won && !state.lost && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div className="word-ladder-input-row">
            <div className="word-ladder-tiles">
              {Array.from({ length: state.wordLength }, (_, i) => {
                const ch = state.inputWord[i] ?? "";
                const isActive = i === state.inputWord.length;
                return (
                  <div key={i} className={`word-ladder-tile${isActive ? " active" : ""}`}>
                    {ch}
                  </div>
                );
              })}
            </div>
            <button
              className="word-ladder-submit"
              onClick={() => dispatch({ type: "submit" } as WordLadderAction)}
              disabled={state.inputWord.length !== state.wordLength}
            >
              Go
            </button>
          </div>
          {state.error && <div className="word-ladder-error">{state.error}</div>}
          <div style={{ fontSize: "0.78rem", color: "#9ca3af" }}>
            Click the puzzle then type your word and press Enter, or type here and click Go
          </div>
        </div>
      )}

      {(state.won || state.lost) && (
        <div className={`word-ladder-status ${state.won ? "won" : "lost"}`}>
          {state.won
            ? `You made it in ${movesUsed} move${movesUsed !== 1 ? "s" : ""}!`
            : `Out of moves! The target was ${state.target}.`}
        </div>
      )}

      {movesLeft <= 3 && !state.won && !state.lost && (
        <div className="word-ladder-error">{movesLeft} move{movesLeft !== 1 ? "s" : ""} left!</div>
      )}
    </div>
  );
}
