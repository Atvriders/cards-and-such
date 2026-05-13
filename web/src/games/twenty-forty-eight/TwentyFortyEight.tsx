import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TwoFortyEightState, TwoFortyEightAction, Dir } from "./state.js";
import { isTerminal } from "./state.js";
import { twoFortyEightSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./TwentyFortyEight.css";

type TFESettings = SettingsOf<typeof twoFortyEightSettings>;

function tileFontSize(value: number): string | undefined {
  if (value >= 1000) return undefined; // handled by CSS data-attr
  return undefined;
}

function tileDataValue(value: number): string {
  if (value === 0) return "0";
  const known = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192];
  if (known.includes(value)) return String(value);
  return "large";
}

export function TwentyFortyEight({
  state,
  dispatch,
  onGameOver,
}: GameProps<TwoFortyEightState, TFESettings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  // Keyboard handler
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const s = stateRef.current;
      if (s.ended) return;

      const dirMap: Record<string, Dir> = {
        ArrowUp: "up",
        w: "up",
        W: "up",
        ArrowDown: "down",
        s: "down",
        S: "down",
        ArrowLeft: "left",
        a: "left",
        A: "left",
        ArrowRight: "right",
        d: "right",
        D: "right",
      };

      const dir = dirMap[e.key];
      if (dir) {
        e.preventDefault();
        dispatch({ type: "slide", dir } as TwoFortyEightAction);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dispatch]);

  const terminal = isTerminal(state);
  const { size, grid, score } = state;

  const cellSize = size === 5 ? 60 : size === 3 ? 88 : 72;
  const gap = 8;
  const padding = 8;
  const gridPx = size * cellSize + (size - 1) * gap + padding * 2;

  const showWinOverlay = state.won && !state.continued && !state.ended;
  const showLoseOverlay = state.lost && !state.ended;

  return (
    <div className="tfe-game">
      <div className="tfe-header">
        <div className="tfe-score-box">
          <div className="tfe-score-label">Score</div>
          <div className="tfe-score-value">{score}</div>
        </div>
        {terminal && (
          <div className="tfe-score-box">
            <div className="tfe-score-label">Final</div>
            <div className="tfe-score-value">{terminal.score}</div>
          </div>
        )}
      </div>

      <div className="tfe-grid-wrapper" style={{ width: gridPx, height: gridPx }}>
        <div
          className="tfe-grid"
          style={{
            gridTemplateColumns: `repeat(${size}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${size}, ${cellSize}px)`,
            width: gridPx,
            height: gridPx,
          }}
        >
          {grid.map((value, idx) => (
            <div
              key={idx}
              className="tfe-cell"
              data-value={tileDataValue(value)}
              style={{
                width: cellSize,
                height: cellSize,
                fontSize: tileFontSize(value),
              }}
            >
              {value !== 0 ? value : ""}
            </div>
          ))}
        </div>

        {showWinOverlay && (
          <div className="tfe-overlay">
            <h2>You reached {state.targetValue}!</h2>
            <p>Keep going for a higher score?</p>
            <div className="tfe-overlay-buttons">
              <button
                className="tfe-btn"
                onClick={() => dispatch({ type: "continue" } as TwoFortyEightAction)}
              >
                Keep Going
              </button>
              <button
                className="tfe-btn tfe-btn--secondary"
                onClick={() => dispatch({ type: "stop" } as TwoFortyEightAction)}
              >
                Finish
              </button>
            </div>
          </div>
        )}

        {showLoseOverlay && (
          <div className="tfe-overlay">
            <h2>Game Over</h2>
            <p>Score: {score}</p>
            <div className="tfe-overlay-buttons">
              <button
                className="tfe-btn"
                onClick={() => dispatch({ type: "stop" } as TwoFortyEightAction)}
              >
                Finish
              </button>
            </div>
          </div>
        )}

        {state.ended && (
          <div className="tfe-overlay">
            <h2>{state.won ? "Well done!" : "Game Over"}</h2>
            <p>Final score: {score}</p>
          </div>
        )}
      </div>

      <div className="tfe-hint">Arrow keys / WASD to slide tiles</div>
    </div>
  );
}
