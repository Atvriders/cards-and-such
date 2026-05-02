import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HelicopterFlyerState, HelicopterFlyerAction, HelicopterFlyerSettings } from "./state.js";
import { isTerminal, LANES, LANE_LENGTH, TICK_MS } from "./state.js";
import "./Game.css";

const PLAYER_ICON = "🚁";
const OBSTACLE_ICON = "🟧";

export function HelicopterFlyerGame({ state, dispatch, onGameOver }: GameProps<HelicopterFlyerState, HelicopterFlyerSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as HelicopterFlyerAction), TICK_MS);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  useEffect(() => {
    function handleKey(e: KeyboardEvent): void {
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") { e.preventDefault(); dispatch({ type: "lane", dir: -1 } as HelicopterFlyerAction); }
      else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") { e.preventDefault(); dispatch({ type: "lane", dir: 1 } as HelicopterFlyerAction); }
      else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { e.preventDefault(); dispatch({ type: "lane", dir: -1 } as HelicopterFlyerAction); }
      else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { e.preventDefault(); dispatch({ type: "lane", dir: 1 } as HelicopterFlyerAction); }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [dispatch]);
  if (state.phase === "done") {
    return (
      <div className="hlcpt-wrap">
        <div className="hlcpt-done">
          <h2>Crashed!</h2>
          <div className="hlcpt-stats">Survived {state.ticks} ticks</div>
          <div className="hlcpt-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="hlcpt-wrap">
      <div className="hlcpt-header">
        <span className="hlcpt-info">Survived: {state.ticks}</span>
        <span className="hlcpt-score">{state.score} pts</span>
      </div>
      <div className="hlcpt-track">
        {Array.from({ length: LANES }).map((_, lane) => (
          <button key={lane} className={`hlcpt-lane${state.playerLane === lane ? " active" : ""}`}
            onClick={() => dispatch({ type: "setLane", lane } as HelicopterFlyerAction)}
            aria-label={`lane ${lane}`}>
            {state.playerLane === lane && (
              <span className="hlcpt-player" style={{ left: `${100 / LANE_LENGTH / 2}%` }}>{PLAYER_ICON}</span>
            )}
            {state.obstacles.filter(o => o.lane === lane).map(o => (
              <span key={o.id} className="hlcpt-obstacle"
                style={{ left: `${(o.x + 0.5) * 100 / LANE_LENGTH}%` }}>{OBSTACLE_ICON}</span>
            ))}
          </button>
        ))}
      </div>
      <div className="hlcpt-controls">
        <button data-testid="hint-target-helicopter-flyer-primary" className="hlcpt-btn" onClick={() => dispatch({ type: "lane", dir: -1 } as HelicopterFlyerAction)}>↑ Up</button>
        <button className="hlcpt-btn" onClick={() => dispatch({ type: "lane", dir: 1 } as HelicopterFlyerAction)}>↓ Down</button>
      </div>
      <div className="hlcpt-hint">Use arrow keys / WASD to switch lanes — avoid the {OBSTACLE_ICON}</div>
    </div>
  );
}
