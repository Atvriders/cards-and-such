import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ImageMemoryState } from "./state.js";
import { isTerminal } from "./state.js";
import type { imageMemorySettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./Game.css";

type Settings = SettingsOf<typeof imageMemorySettings>;

const FLASH_MS = 700;

export function ImageMemory({
  state,
  dispatch,
  onGameOver,
}: GameProps<ImageMemoryState, Settings>): JSX.Element {
  const terminal = isTerminal(state);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.phase !== "showing") return;
    timerRef.current = setTimeout(() => {
      dispatch({ type: "advance-flash" });
    }, FLASH_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [state.phase, state.flashIndex, dispatch]);

  const count = parseInt(state.settings.difficulty, 10);
  const cols = count === 9 ? 3 : count === 8 ? 4 : 3;

  const currentFlashIcon = state.phase === "showing" && state.flashIndex >= 0
    ? state.showOrder[state.flashIndex]
    : -1;

  return (
    <div className="im-game">
      <div className="im-header">
        <span>Round <strong>{state.round}/5</strong></span>
        <span>Score <strong>{state.score}</strong></span>
        {state.phase === "input" && (
          <span>Step <strong>{state.playerStep + 1}/{count}</strong></span>
        )}
      </div>

      {state.phase === "idle" && (
        <div className="im-center">
          <p className="im-desc">Icons will flash one by one. Then click them in the order they appeared!</p>
          <button className="im-btn-primary" onClick={() => dispatch({ type: "start" })}>Start</button>
        </div>
      )}

      {(state.phase === "showing" || state.phase === "input") && (
        <div className="im-center">
          <p className="im-label">
            {state.phase === "showing"
              ? `Watch! (${state.flashIndex + 1}/${count})`
              : "Click them in order!"}
          </p>
          <div className="im-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {state.icons.map((icon, i) => {
              const isFlashing = currentFlashIcon === i;
              const alreadyClicked = state.correctClicks.includes(i);
              return (
                <button
                  key={i}
                  className={`im-icon-btn${isFlashing ? " flashing" : ""}${alreadyClicked ? " done" : ""}`}
                  onClick={() => dispatch({ type: "click-icon", index: i })}
                  disabled={state.phase !== "input" || alreadyClicked}
                >
                  {icon}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {state.phase === "result" && (
        <div className="im-center">
          <div className={`im-result ${state.lastRoundCorrect ? "correct" : "partial"}`}>
            {state.lastRoundCorrect ? "Perfect!" : `${state.correctClicks.length}/${count} correct`}
          </div>
          <p className="im-label">Show order was:</p>
          <div className="im-order-display">
            {state.showOrder.map((idx, pos) => (
              <span
                key={pos}
                className={`im-order-icon${state.playerClicks[pos] === idx ? " ok" : " miss"}`}
              >
                {state.icons[idx]}
              </span>
            ))}
          </div>
          <button className="im-btn-primary" onClick={() => dispatch({ type: "next" })}>
            {state.round >= 5 ? "Finish" : "Next Round"}
          </button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="im-center">
          <div className="im-result correct">Done!</div>
          <p className="im-label">Final Score: <strong>{terminal?.score ?? state.score}</strong></p>
          <button className="im-btn-primary" onClick={() => dispatch({ type: "start" })}>Play Again</button>
        </div>
      )}
    </div>
  );
}
