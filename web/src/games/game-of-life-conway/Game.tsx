import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ConwayState, ConwayAction, ConwaySettings, Pattern } from "./state.js";
import { isTerminal, liveCount, score } from "./state.js";
import "./Game.css";

const PRESET_BUTTONS: { key: Pattern; label: string }[] = [
  { key: "glider", label: "Glider" },
  { key: "blinker", label: "Blinker" },
  { key: "pulsar", label: "Pulsar" },
  { key: "rpentomino", label: "R-pent" },
  { key: "random", label: "Random" },
];

export function GameOfLifeConwayGame({ state, dispatch, onGameOver }: GameProps<ConwayState, ConwaySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  // Auto-run loop: dispatch step every 200ms when isRunning is true.
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;
  useEffect(() => {
    if (!state.isRunning || state.phase === "done") return;
    const id = window.setInterval(() => {
      dispatchRef.current({ type: "step" } as ConwayAction);
    }, 200);
    return () => window.clearInterval(id);
  }, [state.isRunning, state.phase]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (state.phase === "done") return;
      if (e.key === " ") { e.preventDefault(); dispatch({ type: "toggleRun" } as ConwayAction); }
      else if ((e.key === "s" || e.key === "S") && !state.isRunning) { e.preventDefault(); dispatch({ type: "step" } as ConwayAction); }
      else if ((e.key === "c" || e.key === "C") && !state.isRunning) { e.preventDefault(); dispatch({ type: "clear" } as ConwayAction); }
      else if (e.key === "r" || e.key === "R") { e.preventDefault(); dispatch({ type: "reset" } as ConwayAction); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch, state.phase, state.isRunning]);

  const live = liveCount(state.grid);
  const size = state.size;

  return (
    <div className="golconway-wrap">
      <div className="golconway-hud">
        <div className="golconway-stat">
          <span className="golconway-stat-label">Generation</span>
          <span className="golconway-stat-value">{state.generation}</span>
        </div>
        <div className="golconway-stat">
          <span className="golconway-stat-label">Live</span>
          <span className="golconway-stat-value">{live}</span>
        </div>
        <div className="golconway-stat">
          <span className="golconway-stat-label">Peak</span>
          <span className="golconway-stat-value">{state.maxLive}</span>
        </div>
        <div className="golconway-stat golconway-stat-score">
          <span className="golconway-stat-label">Score</span>
          <span className="golconway-stat-value">{score(state)}</span>
        </div>
      </div>

      <div
        className="golconway-grid"
        style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
        data-running={state.isRunning ? "true" : "false"}
      >
        {state.grid.map((v, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Cell row ${Math.floor(i / size) + 1} col ${(i % size) + 1}, ${v ? "alive" : "dead"}`}
            aria-pressed={v ? true : false}
            className={`golconway-cell${v ? " golconway-on" : ""}`}
            onClick={() => dispatch({ type: "toggle", idx: i } as ConwayAction)}
            disabled={state.isRunning || state.phase === "done"}
          />
        ))}
      </div>

      <div className="golconway-controls">
        <button
          type="button"
          className="golconway-btn golconway-btn-step"
          aria-label="Step one generation (S)"
          onClick={() => dispatch({ type: "step" } as ConwayAction)}
          disabled={state.isRunning || state.phase === "done"}
        >
          Step
        </button>
        <button
          type="button"
          className={`golconway-btn ${state.isRunning ? "golconway-btn-pause" : "golconway-btn-run"}`}
          aria-label={state.isRunning ? "Pause simulation (Space)" : "Run simulation (Space)"}
          onClick={() => dispatch({ type: "toggleRun" } as ConwayAction)}
          disabled={state.phase === "done"}
        >
          {state.isRunning ? "Pause" : "Run"}
        </button>
        <button
          type="button"
          className="golconway-btn golconway-btn-clear"
          onClick={() => dispatch({ type: "clear" } as ConwayAction)}
          disabled={state.isRunning || state.phase === "done"}
        >
          Clear
        </button>
        <button
          type="button"
          className="golconway-btn golconway-btn-reset"
          onClick={() => dispatch({ type: "reset" } as ConwayAction)}
          disabled={state.phase === "done"}
        >
          Reset
        </button>
        <button
          type="button"
          className="golconway-btn golconway-btn-finish"
          onClick={() => dispatch({ type: "finish" } as ConwayAction)}
          disabled={state.phase === "done"}
        >
          Finish
        </button>
      </div>

      <div className="golconway-presets">
        <span className="golconway-presets-label">Patterns:</span>
        {PRESET_BUTTONS.map((p) => (
          <button
            key={p.key}
            type="button"
            className="golconway-preset"
            onClick={() => dispatch({ type: "preset", preset: p.key } as ConwayAction)}
            disabled={state.isRunning || state.phase === "done"}
          >
            {p.label}
          </button>
        ))}
      </div>

      {state.phase === "done" && (
        <div className="golconway-done">
          <div className="golconway-done-title">Run complete</div>
          <div className="golconway-done-line">Generations survived: <b>{state.generation}</b></div>
          <div className="golconway-done-line">Peak live cells: <b>{state.maxLive}</b></div>
          <div className="golconway-done-score">Final score: {score(state)}</div>
        </div>
      )}
    </div>
  );
}
