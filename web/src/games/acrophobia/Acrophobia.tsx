import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AcrophobiaState, AcrophobiaAction, AcrophobiaSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Acrophobia.css";

export function Acrophobia({ state, dispatch, onGameOver }: GameProps<AcrophobiaState, AcrophobiaSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (state.submitted) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Backspace") {
      dispatch({ type: "backspace" } as AcrophobiaAction);
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (e.shiftKey) {
        dispatch({ type: "prevSlot" } as AcrophobiaAction);
      } else {
        dispatch({ type: "nextSlot" } as AcrophobiaAction);
      }
    } else if (e.key === "Enter") {
      if (!state.submitted) {
        dispatch({ type: "submit" } as AcrophobiaAction);
      }
    } else if (e.key.length === 1) {
      dispatch({ type: "typeChar", char: e.key } as AcrophobiaAction);
    }
  }, [state.submitted, dispatch]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const { acronym, canonicalWords, playerWords, activeSlot, inputText, submitted, correctSlots, exactMatch, score, round, maxRounds, totalScore, settings } = state;

  const isLastRound = round >= maxRounds;

  return (
    <div className="acro-wrap">
      <div className="acro-header">
        <h2>Round {round} / {maxRounds}</h2>
        <div className="acro-total-score">Total: {totalScore}</div>
      </div>

      <div className="acro-acronym">{acronym}</div>

      {settings.difficulty === "easy" && (
        <div className="acro-hint">
          Easy mode: word lengths shown
        </div>
      )}

      <div className="acro-slots">
        {acronym.split("").map((letter, i) => {
          const isActive = !submitted && i === activeSlot;
          const displayText = isActive ? inputText : (playerWords[i] ?? "");
          let slotClass = "acro-slot-input";
          if (submitted) {
            const correct = playerWords[i]!.length > 0 &&
              playerWords[i]![0]!.toUpperCase() === canonicalWords[i]![0]!.toUpperCase();
            slotClass += correct ? " correct" : " wrong";
          } else if (isActive) {
            slotClass += " active";
          }

          return (
            <div key={i} className="acro-slot">
              <div className="acro-slot-letter">{letter}</div>
              <div
                className={slotClass}
                onClick={() => !submitted && dispatch({ type: "selectSlot", slot: i } as AcrophobiaAction)}
                role="textbox"
                aria-label={`Word for ${letter}`}
              >
                {displayText || <span style={{ color: "#bbb" }}>type a word starting with {letter}…</span>}
              </div>
              {settings.difficulty === "easy" && (
                <div className="acro-slot-length">
                  ({canonicalWords[i]!.length} letters)
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <p className="acro-keyboard-hint">Tab = next slot · Shift+Tab = prev · Enter = submit</p>
      )}

      <div className="acro-actions">
        {!submitted ? (
          <button
            className="acro-btn submit"
            onClick={() => dispatch({ type: "submit" } as AcrophobiaAction)}
          >
            Submit
          </button>
        ) : !isLastRound ? (
          <button
            className="acro-btn next"
            onClick={() => dispatch({ type: "nextRound" } as AcrophobiaAction)}
          >
            Next Round
          </button>
        ) : null}
      </div>

      {submitted && (
        <div className={`acro-result${exactMatch ? " won" : ""}`}>
          <h3>
            {exactMatch ? "Perfect!" : correctSlots === acronym.length ? "All first letters correct!" : `${correctSlots}/${acronym.length} first letters correct`}
          </h3>
          <div className="acro-canonical">
            The phrase was: <strong>{canonicalWords.join(" ")}</strong>
          </div>
          <div className="acro-score-line">+{score} points this round</div>
          {isLastRound && (
            <div className="acro-total-score" style={{ marginTop: 8 }}>
              Final score: {totalScore}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
