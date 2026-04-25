import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BreathGaugeState, BreathGaugeSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./BreathGauge.css";

export function BreathGauge({
  state,
  dispatch,
  onGameOver,
}: GameProps<BreathGaugeState, BreathGaugeSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const holdStartRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const fillSpeed = 25; // percent per second

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const updateFill = useCallback(() => {
    if (holdStartRef.current === null) return;
    const elapsed = (Date.now() - holdStartRef.current) / 1000;
    const fill = Math.min(100, elapsed * fillSpeed);
    dispatch({ type: "tick", fillPercent: Math.round(fill) });
    if (fill < 100) {
      rafRef.current = requestAnimationFrame(updateFill);
    } else {
      // Auto-release at 100
      dispatch({ type: "release", fillPercent: 100 });
      holdStartRef.current = null;
    }
  }, [dispatch]);

  function handlePress() {
    if (state.roundResult !== null || state.gameOver) return;
    dispatch({ type: "pressDown" });
    holdStartRef.current = Date.now();
    rafRef.current = requestAnimationFrame(updateFill);
  }

  function handleRelease() {
    if (holdStartRef.current === null) return;
    const elapsed = (Date.now() - holdStartRef.current) / 1000;
    const fill = Math.min(100, elapsed * fillSpeed);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    holdStartRef.current = null;
    dispatch({ type: "release", fillPercent: Math.round(fill) });
  }

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const gaugeHeight = state.fillPercent; // 0–100
  const zoneTopPct = 100 - state.targetHigh; // top offset (0% = top of gauge)
  const zoneHeightPct = state.targetHigh - state.targetLow;
  const markerTopPct = 100 - state.targetPercent;

  return (
    <div className="bg-game">
      <div className="bg-title">Breath Gauge</div>
      <div className="bg-round">Round {state.rounds + 1} / {state.totalRounds}</div>
      <div className="bg-score">Score: {state.score}</div>

      <div className="bg-gauge-container">
        {/* Zone band */}
        <div
          className="bg-zone-band"
          style={{
            top: `${zoneTopPct}%`,
            height: `${zoneHeightPct}%`,
          }}
        />
        {/* Target line */}
        <div
          className="bg-zone-marker"
          style={{ bottom: `${state.targetPercent}%` }}
        />
        {/* Fill */}
        <div
          className="bg-gauge-fill"
          style={{ height: `${gaugeHeight}%` }}
        />
      </div>

      {state.roundResult === null && !state.gameOver && (
        <>
          <div className="bg-instructions">
            Hold the button to fill the gauge. Release when it reaches the yellow zone ({state.targetPercent}%).
          </div>
          <button
            className={`bg-hold-btn ${state.holding ? "holding" : ""}`}
            onMouseDown={handlePress}
            onMouseUp={handleRelease}
            onTouchStart={handlePress}
            onTouchEnd={handleRelease}
          >
            HOLD
          </button>
        </>
      )}

      {state.roundResult !== null && (
        <>
          <div className={`bg-result ${state.roundResult}`}>
            {state.roundResult === "hit"
              ? `Hit! +${state.roundScores[state.roundScores.length - 1]} pts`
              : `Missed at ${state.releasePercent}% — target was ${state.targetPercent}%`}
          </div>
          {!state.gameOver && (
            <button className="bg-next-btn" onClick={() => dispatch({ type: "next" })}>
              Next Round
            </button>
          )}
        </>
      )}

      {state.gameOver && (
        <div className="bg-game-over">
          Done! Final Score: {state.score}<br />
          <span style={{ fontSize: "0.85rem", opacity: 0.75 }}>
            {state.roundScores.filter(s => s > 0).length}/{state.totalRounds} hits
          </span>
        </div>
      )}
    </div>
  );
}
