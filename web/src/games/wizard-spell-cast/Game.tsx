import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WizardSpellCastState, WizardSpellCastSettings } from "./state.js";
import { isTerminal, RUNES } from "./state.js";
import "./Game.css";

export function WizardSpellCastGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<WizardSpellCastState, WizardSpellCastSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.phase === "show") {
      showTimer.current = setTimeout(() => {
        dispatch({ type: "advance-show" });
      }, 700);
    }
    return () => { if (showTimer.current) clearTimeout(showTimer.current); };
  }, [state.phase, state.showIndex, dispatch]);

  const activeRune = state.phase === "show" && state.showIndex < state.sequence.length
    ? state.sequence[state.showIndex]
    : null;

  return (
    <div className="wsc-game">
      <div className="wsc-title">Wizard Spell Cast</div>
      <div className="wsc-stats">
        <span>Round: {state.round}</span>
        <span>Score: {state.score}</span>
        <span>Progress: {state.playerInput.length}/{state.sequence.length}</span>
      </div>

      <div className="wsc-sequence-display">
        {state.phase === "show" && state.showIndex < state.sequence.length && (
          <div className="wsc-showing">
            Watch the rune: <span className="wsc-active-rune">{RUNES[activeRune!]}</span>
          </div>
        )}
        {state.phase === "input" && (
          <div className="wsc-input-prompt">Repeat the spell!</div>
        )}
        {state.phase === "win" && (
          <div className="wsc-win">Spell complete! +{parseInt(state.settings.length, 10) * 100 * (state.round - 1)} pts</div>
        )}
        {state.phase === "fail" && (
          <div className="wsc-fail">Wrong rune! Game over! Score: {state.score}</div>
        )}
      </div>

      <div className="wsc-progress">
        {Array.from({ length: state.sequence.length }, (_, i) => (
          <div
            key={i}
            className={`wsc-pip ${i < state.playerInput.length ? "done" : i === state.playerInput.length && state.phase === "input" ? "active" : ""}`}
          />
        ))}
      </div>

      <div className="wsc-runes">
        {RUNES.map((rune, i) => (
          <button
            key={i}
            className={`wsc-rune-btn ${activeRune === i ? "highlight" : ""}`}
            onClick={() => state.phase === "input" && dispatch({ type: "cast", rune: i })}
            disabled={state.phase !== "input"}
          >
            {rune}
          </button>
        ))}
      </div>

      {(state.phase === "win" || state.phase === "fail") && (
        <button
          className="wsc-next-btn"
          onClick={() => dispatch({ type: "next-round" })}
        >
          {state.phase === "win" ? "Next Round" : "Try Again"}
        </button>
      )}
    </div>
  );
}
