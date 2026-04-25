import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FireworkState, FireworkAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const COLOR_EMOJI: Record<string, string> = {
  red: "🎆", gold: "✨", blue: "💥", green: "🌟", purple: "🎇",
};

export function FireworkShow({
  state,
  dispatch,
  onGameOver,
}: GameProps<FireworkState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => dispatch({ type: "tick" }), 80);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.phase, dispatch]);

  const d = (a: FireworkAction) => dispatch(a);
  const timeLeft = Math.ceil((state.maxTicks - state.tick) / 12.5);

  return (
    <div className="fw-wrap">
      <div className="fw-header">
        <span className="fw-title">Firework Show</span>
        <span className="fw-timer">{timeLeft}s</span>
        <span className="fw-mult">x{state.multiplier.toFixed(1)}</span>
        <span className="fw-score">{state.score}</span>
      </div>

      <div className="fw-sky">
        {state.targets
          .filter(t => !t.hit && t.timeLeft > 0)
          .map(t => (
            <div
              key={t.id}
              className={`fw-target fw-target-${t.color}`}
              style={{
                left: `${t.x}%`,
                top: `${t.y}%`,
                width: `${t.radius * 2}px`,
                height: `${t.radius * 2}px`,
              }}
              onClick={() => d({ type: "tap", targetId: t.id })}
            >
              {COLOR_EMOJI[t.color] ?? "🎆"}
            </div>
          ))}
      </div>

      <div className="fw-stats">
        Hits: {state.hits} | Misses: {state.misses}
      </div>

      {state.phase === "done" && (
        <div className="fw-done">
          Show complete! Score: {state.score}
          <div style={{ fontSize: "0.9rem", marginTop: 4 }}>
            {state.hits} hits, {state.misses} misses
          </div>
        </div>
      )}
    </div>
  );
}
