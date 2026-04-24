import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PatternRecallState } from "./state.js";
import { isTerminal, GRID_COLS, GRID_SIZE } from "./state.js";
import type { patternRecallSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./Game.css";

type Settings = SettingsOf<typeof patternRecallSettings>;

const SHOW_MS = 2500;

export function PatternRecall({
  state,
  dispatch,
  onGameOver,
}: GameProps<PatternRecallState, Settings>): JSX.Element {
  const terminal = isTerminal(state);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.phase !== "showing") return;
    timerRef.current = setTimeout(() => dispatch({ type: "reveal" }), SHOW_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [state.phase, state.round, dispatch]);

  const cells = Array.from({ length: GRID_SIZE }, (_, i) => i);

  const getCellClass = (i: number) => {
    const classes = ["pr-cell"];
    if (state.phase === "showing" && state.pattern.includes(i)) classes.push("highlighted");
    if (state.phase === "input" && state.playerPattern.includes(i)) classes.push("selected");
    if (state.phase === "result") {
      const inPattern = state.pattern.includes(i);
      const inPlayer = state.playerPattern.includes(i);
      if (inPattern && inPlayer) classes.push("correct");
      else if (inPattern && !inPlayer) classes.push("missed");
      else if (!inPattern && inPlayer) classes.push("wrong");
    }
    return classes.join(" ");
  };

  return (
    <div className="pr-game">
      <div className="pr-header">
        <span>Round <strong>{state.round}/8</strong></span>
        <span>Score <strong>{state.score}</strong></span>
        {state.lastAccuracy !== null && (
          <span>Accuracy <strong>{Math.round(state.lastAccuracy * 100)}%</strong></span>
        )}
      </div>

      {state.phase === "idle" && (
        <div className="pr-center">
          <p className="pr-desc">A pattern of highlighted cells will flash briefly. Reproduce it from memory!</p>
          <button className="pr-btn-primary" onClick={() => dispatch({ type: "start" })}>Start</button>
        </div>
      )}

      {(state.phase === "showing" || state.phase === "input" || state.phase === "result") && (
        <div className="pr-center">
          <p className="pr-label">
            {state.phase === "showing" ? "Memorize the pattern!" :
             state.phase === "input" ? "Click the cells you saw!" :
             `${Math.round((state.lastAccuracy ?? 0) * 100)}% accurate`}
          </p>
          <div className="pr-grid" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}>
            {cells.map((i) => (
              <button
                key={i}
                className={getCellClass(i)}
                onClick={() => dispatch({ type: "toggle-cell", cell: i })}
                disabled={state.phase !== "input"}
              />
            ))}
          </div>
          {state.phase === "input" && (
            <button
              className="pr-btn-primary"
              onClick={() => dispatch({ type: "submit" })}
            >
              Submit
            </button>
          )}
          {state.phase === "result" && (
            <div className="pr-result-row">
              <div className="pr-legend">
                <span className="pr-dot correct" /> Correct
                <span className="pr-dot missed" /> Missed
                <span className="pr-dot wrong" /> Wrong
              </div>
              <button className="pr-btn-primary" onClick={() => dispatch({ type: "next" })}>
                {state.round >= 8 ? "Finish" : "Next"}
              </button>
            </div>
          )}
        </div>
      )}

      {state.phase === "done" && (
        <div className="pr-center">
          <div className="pr-done">Done!</div>
          <p className="pr-desc">Final Score: <strong>{terminal?.score ?? state.score}</strong></p>
          <button className="pr-btn-primary" onClick={() => dispatch({ type: "start" })}>Play Again</button>
        </div>
      )}
    </div>
  );
}
