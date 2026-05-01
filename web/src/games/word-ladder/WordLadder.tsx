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
    <div className="wlr-ladder" tabIndex={0} onKeyDown={handleKey} style={{ outline: "none" }}>
      <div className="wlr-ladder-header">
        <div style={{ textAlign: "center" }}>
          <div className="wlr-ladder-label">Start</div>
          <div className="wlr-ladder-word">{state.start}</div>
        </div>
        <div style={{ fontSize: "1.5rem", color: "#9ca3af" }}>→</div>
        <div style={{ textAlign: "center" }}>
          <div className="wlr-ladder-label">Target</div>
          <div className="wlr-ladder-word target">{state.target}</div>
        </div>
      </div>

      <div className="wlr-ladder-moves">
        Moves used: {movesUsed} / {state.maxMoves} (max)
      </div>

      <div className="wlr-ladder-chain">
        {state.history.map((word, i) => (
          <div key={`${word}-${i}`} className={`wlr-ladder-step ${i === 0 ? "start" : state.won && i === state.history.length - 1 ? "won-step" : "middle"}`}>
            {i > 0 && <span className="wlr-ladder-arrow">↓</span>}
            <span>{word}</span>
          </div>
        ))}
      </div>

      {!state.won && !state.lost && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div className="wlr-ladder-input-row">
            <div className="wlr-ladder-tiles">
              {Array.from({ length: state.wordLength }, (_, i) => {
                const ch = state.inputWord[i] ?? "";
                const isActive = i === state.inputWord.length;
                return (
                  <div key={i} className={`wlr-ladder-tile${isActive ? " active" : ""}`}>
                    {ch}
                  </div>
                );
              })}
            </div>
            <button
              className="wlr-ladder-submit"
              onClick={() => dispatch({ type: "submit" } as WordLadderAction)}
              disabled={state.inputWord.length !== state.wordLength}
            >
              Go
            </button>
          </div>
          {state.error && <div className="wlr-ladder-error">{state.error}</div>}
          <div style={{ fontSize: "0.78rem", color: "#9ca3af" }}>
            Click the puzzle then type your word and press Enter, or type here and click Go
          </div>
        </div>
      )}

      {(state.won || state.lost) && (
        <div className={`wlr-ladder-status ${state.won ? "won" : "lost"}`}>
          {state.won
            ? `You made it in ${movesUsed} move${movesUsed !== 1 ? "s" : ""}!`
            : `Out of moves! The target was ${state.target}.`}
        </div>
      )}

      {movesLeft <= 3 && !state.won && !state.lost && (
        <div className="wlr-ladder-error">{movesLeft} move{movesLeft !== 1 ? "s" : ""} left!</div>
      )}
    </div>
  );
}
