import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PaperTossState, PaperTossSettings } from "./state.js";
import { isTerminal, TOTAL_THROWS } from "./state.js";
import "./Game.css";

export function PaperTossGame({ state, dispatch, onGameOver }: GameProps<PaperTossState, PaperTossSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const [flying, setFlying] = useState(false);

  const lastThrow = state.throws[state.throws.length - 1];

  // Animate throw
  useEffect(() => {
    if (state.phase === "thrown") {
      setFlying(true);
      const t = setTimeout(() => setFlying(false), 700);
      return () => clearTimeout(t);
    }
  }, [state.phase, state.throws.length]);

  const wind = state.winds[state.throwIndex] ?? 0;
  const windDir = wind > 5 ? "→" : wind < -5 ? "←" : "calm";
  const windStr = Math.abs(wind) < 5 ? "No wind" : `Wind ${windDir} (${Math.abs(wind).toFixed(0)})`;

  // Trajectory line angle (visual only) based on angle slider
  const trajectoryAngle = state.angle - 90; // degrees from vertical

  return (
    <div className="paper-toss">
      <div className="pt-score">Score: {state.score}</div>
      <div className="pt-throw-count">Throw {Math.min(state.throwIndex + 1, TOTAL_THROWS)} of {TOTAL_THROWS}</div>

      <div className="pt-canvas-area">
        <div className="pt-wind">{windStr}</div>
        {/* Trajectory indicator */}
        {state.phase === "aiming" && (
          <div
            className="pt-trajectory"
            style={{
              height: "120px",
              left: "50%",
              bottom: "50px",
              transform: `translateX(-50%) rotate(${trajectoryAngle}deg)`,
              opacity: 0.5,
            }}
          />
        )}
        <div className="pt-basket">🗑️</div>
        <div
          className={`pt-paper${flying ? " flying" : ""}${lastThrow && state.phase === "thrown" ? (lastThrow.hit ? " hit" : " miss") : ""}`}
          style={flying && lastThrow ? {
            left: `calc(50% + ${lastThrow.offset * (lastThrow.wind < 0 ? -2 : 2)}px)`,
            transform: "translateX(-50%)",
          } : { left: "50%", transform: "translateX(-50%)" }}
        >
          📄
        </div>
      </div>

      {state.phase === "aiming" && (
        <div className="pt-controls">
          <div className="pt-slider-row">
            <span className="pt-slider-label">Angle</span>
            <input
              type="range"
              className="pt-slider"
              min={30} max={150}
              value={state.angle}
              onChange={(e) => dispatch({ type: "setAngle", value: Number(e.target.value) })}
            />
            <span className="pt-slider-value">{state.angle}°</span>
          </div>
          <div className="pt-slider-row">
            <span className="pt-slider-label">Power</span>
            <input
              type="range"
              className="pt-slider"
              min={1} max={100}
              value={state.power}
              onChange={(e) => dispatch({ type: "setPower", value: Number(e.target.value) })}
            />
            <span className="pt-slider-value">{state.power}</span>
          </div>
          <button data-testid="hint-target-paper-toss-action" onClick={() => dispatch({ type: "throw" })}>Throw!</button>
        </div>
      )}

      {state.phase === "thrown" && lastThrow && (
        <div className="pt-controls">
          <div className={`pt-result ${lastThrow.hit ? "hit" : "miss"}`}>
            {lastThrow.hit ? `Hit! +${Math.max(1, Math.round(10 - lastThrow.offset))} pts` : "Miss!"}
            {" "}(off by {lastThrow.offset.toFixed(1)})
          </div>
          <button onClick={() => dispatch({ type: "next" })}>Next Throw</button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="pt-controls">
          <div className="pt-done">
            Done! Score: {state.score}<br />
            Hits: {state.throws.filter((t) => t.hit).length}/{TOTAL_THROWS}
          </div>
          <button onClick={() => dispatch({ type: "newGame" })}>Play Again</button>
        </div>
      )}

      <div className="pt-history">
        {state.throws.map((t, i) => (
          <div key={i} className={`pt-history-dot ${t.hit ? "hit" : "miss"}`} title={t.hit ? "Hit" : "Miss"} />
        ))}
      </div>

      <div className="pt-hint">Ideal: Angle 90°, Power 60. Adjust for wind. Aim for the basket!</div>
    </div>
  );
}
