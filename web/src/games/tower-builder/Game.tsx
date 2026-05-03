import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TowerBuilderState, TowerAction } from "./state.js";
import { isTerminal, MAX_LEVELS, PLATFORM_WIDTH } from "./state.js";
import "./Game.css";

const SCALE = 1; // canvas width = PLATFORM_WIDTH * scale
const BLOCK_H = 20;
const CANVAS_H = 160;

function blockColor(idx: number, total: number): string {
  const hue = Math.round((idx / Math.max(1, total)) * 120); // green to red
  return `hsl(${120 - hue}, 70%, 50%)`;
}

export function TowerBuilderGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<TowerBuilderState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const d = (a: TowerAction) => dispatch(a);
  const rafRef = useRef<number>(0);

  // Auto-tick swing animation
  const tick = useCallback(() => {
    if (state.phase === "swing") dispatch({ type: "tick" });
    rafRef.current = requestAnimationFrame(tick);
  }, [state.phase, dispatch]);

  useEffect(() => {
    if (state.phase === "swing") {
      rafRef.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafRef.current);
    }
    return () => {};
  }, [state.phase, tick]);

  const canvasW = PLATFORM_WIDTH * SCALE;
  const widthPct = (state.currentBlock.width / PLATFORM_WIDTH) * 100;
  const placedCount = state.blocks.length;

  return (
    <div className="tb-wrap">
      <div className="tb-header">
        <span className="tb-title">🏗️ Tower Builder</span>
        <span>Level {Math.min(state.level, MAX_LEVELS)}/{MAX_LEVELS}</span>
        <span className="tb-score">{state.score} pts</span>
      </div>

      <div className="tb-canvas" style={{ width: canvasW }}>
        {/* Placed blocks */}
        {state.blocks.slice(0, CANVAS_H / BLOCK_H).map((blk, i) => (
          <div
            key={i}
            className="tb-block placed"
            style={{
              left: `${(blk.x / PLATFORM_WIDTH) * 100}%`,
              width: `${(blk.width / PLATFORM_WIDTH) * 100}%`,
              bottom: i * BLOCK_H,
              background: i === 0 ? "#37474f" : blockColor(i, placedCount),
            }}
          />
        ))}
        {/* Current swinging block */}
        {state.phase === "swing" && (
          <div
            className="tb-block current"
            style={{
              left: `${(state.currentBlock.x / PLATFORM_WIDTH) * 100}%`,
              width: `${(state.currentBlock.width / PLATFORM_WIDTH) * 100}%`,
              bottom: placedCount * BLOCK_H,
            }}
          />
        )}
      </div>

      <div className="tb-info">Block width: {Math.round(state.currentBlock.width)}px</div>
      <div className="tb-width-bar">
        <div className="tb-width-fill" style={{ width: `${widthPct}%` }} />
      </div>

      {state.phase === "swing" && (
        <button data-testid="hint-target-tower-builder-action" className="tb-drop-btn" onClick={() => d({ type: "drop" })}>
          Drop! (Space)
        </button>
      )}

      {state.phase === "placed" && (
        <button className="tb-next-btn" onClick={() => d({ type: "nextLevel" })}>
          Continue →
        </button>
      )}

      {state.phase === "done" && (
        <div className="tb-done">
          <div className="tb-final">Score: {state.score}</div>
          <div>Blocks stacked: {state.stackHeight}/{MAX_LEVELS}</div>
          <div style={{ marginTop: 8 }}>
            {state.score >= 2000 ? "🏆 Master Builder!" : state.score >= 1000 ? "👍 Solid tower!" : "🏗️ Keep stacking!"}
          </div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="tb-log">
          {[...state.log].reverse().slice(0, 8).map((l, i) => <div key={i} className="tb-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
