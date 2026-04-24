import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DualNBackState } from "./state.js";
import { isTerminal, GRID_SIZE } from "./state.js";
import type { dualNBackSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./Game.css";

type Settings = SettingsOf<typeof dualNBackSettings>;

const SHOW_MS = 1500;

export function DualNBack({
  state,
  dispatch,
  onGameOver,
}: GameProps<DualNBackState, Settings>): JSX.Element {
  const terminal = isTerminal(state);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.phase !== "showing") return;
    timerRef.current = setTimeout(() => {
      dispatch({ type: "next-stimulus" });
    }, SHOW_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [state.phase, state.currentIndex, dispatch]);

  const currentStim = state.stimuli[state.currentIndex];
  const cells = Array(GRID_SIZE * GRID_SIZE).fill(null);

  return (
    <div className="dnb-game">
      <div className="dnb-header">
        <span>N = <strong>{state.n}</strong></span>
        <span>Trial <strong>{Math.min(state.currentIndex + 1, state.totalTrials)}/{state.totalTrials}</strong></span>
        <span>Score <strong>{Math.max(0, state.score)}</strong></span>
      </div>

      {state.phase === "idle" && (
        <div className="dnb-center">
          <h3 className="dnb-title">Dual N-Back</h3>
          <p className="dnb-desc">
            Watch the highlighted cell and letter. Press <strong>Position</strong> if the cell matches {state.n}-back,
            and <strong>Sound</strong> if the letter matches {state.n}-back.
          </p>
          <button className="dnb-btn-primary" onClick={() => dispatch({ type: "start" })}>Start</button>
        </div>
      )}

      {(state.phase === "showing" || state.phase === "respond") && (
        <div className="dnb-center">
          <div className="dnb-grid">
            {cells.map((_, i) => (
              <div
                key={i}
                className={`dnb-cell${state.phase === "showing" && currentStim?.gridCell === i ? " active" : ""}`}
              />
            ))}
          </div>

          <div className="dnb-sound">
            {state.phase === "showing" && currentStim ? (
              <span className="dnb-letter">{currentStim.sound}</span>
            ) : (
              <span className="dnb-letter-blank">?</span>
            )}
          </div>

          {state.phase === "respond" && state.currentIndex >= state.n && (
            <div className="dnb-respond">
              <p className="dnb-prompt">Does this match {state.n}-back?</p>
              <div className="dnb-btn-row">
                <button
                  className={`dnb-match-btn${state.currentResponse.positionMatch ? " pressed" : ""}`}
                  onClick={() => dispatch({ type: "press-position" })}
                >
                  Position (L)
                </button>
                <button
                  className={`dnb-match-btn${state.currentResponse.soundMatch ? " pressed" : ""}`}
                  onClick={() => dispatch({ type: "press-sound" })}
                >
                  Sound (R)
                </button>
              </div>
              <button className="dnb-btn-primary" onClick={() => dispatch({ type: "confirm" })}>
                Confirm
              </button>
            </div>
          )}
        </div>
      )}

      {state.phase === "done" && (
        <div className="dnb-center">
          <h3 className="dnb-title">Complete!</h3>
          <div className="dnb-stats">
            <div>Hits: <strong>{state.hits}</strong></div>
            <div>Misses: <strong>{state.misses}</strong></div>
            <div>False Alarms: <strong>{state.falseAlarms}</strong></div>
            <div>Final Score: <strong>{terminal?.score ?? Math.max(0, state.score)}</strong></div>
          </div>
          <button className="dnb-btn-primary" onClick={() => dispatch({ type: "start" })}>Play Again</button>
        </div>
      )}
    </div>
  );
}
