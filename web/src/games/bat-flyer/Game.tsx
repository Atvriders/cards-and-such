import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BatFlyerState, BatFlyerAction, BatFlyerSettings } from "./state.js";
import { isTerminal, LANES, LANE_LENGTH, TICK_MS } from "./state.js";
import "./Game.css";

const PLAYER_ICON = "🦇";
const OBSTACLE_ICON = "🌙";

export function BatFlyerGame({ state, dispatch, onGameOver }: GameProps<BatFlyerState, BatFlyerSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as BatFlyerAction), TICK_MS);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  useEffect(() => {
    function handleKey(e: KeyboardEvent): void {
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") { e.preventDefault(); dispatch({ type: "lane", dir: -1 } as BatFlyerAction); }
      else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") { e.preventDefault(); dispatch({ type: "lane", dir: 1 } as BatFlyerAction); }
      else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { e.preventDefault(); dispatch({ type: "lane", dir: -1 } as BatFlyerAction); }
      else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { e.preventDefault(); dispatch({ type: "lane", dir: 1 } as BatFlyerAction); }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [dispatch]);
  if (state.phase === "done") {
    return (
      <div className="btfly-wrap">
        <div className="btfly-done bounce-in">
          <h2>Crashed!</h2>
          <div className="btfly-stats">Survived {state.ticks} ticks</div>
          <div className="btfly-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="btfly-wrap fade-in">
      <div className="btfly-header">
        <span className="btfly-info">Survived: {state.ticks}</span>
        <span className="btfly-score pulse">{state.score} pts</span>
      </div>
      <div className="btfly-track">
        {Array.from({ length: LANES }).map((_, lane) => (
          <button key={lane} className={`btfly-lane${state.playerLane === lane ? " active" : ""}`}
            onClick={() => dispatch({ type: "setLane", lane } as BatFlyerAction)}
            aria-label={`lane ${lane}`}>
            {state.playerLane === lane && (
              <span className="btfly-player" style={{ left: `${100 / LANE_LENGTH / 2}%` }}>{PLAYER_ICON}</span>
            )}
            {state.obstacles.filter(o => o.lane === lane).map(o => (
              <span key={o.id} className="btfly-obstacle"
                style={{ left: `${(o.x + 0.5) * 100 / LANE_LENGTH}%` }}>{OBSTACLE_ICON}</span>
            ))}
          </button>
        ))}
      </div>
      <div className="btfly-controls">
        <button title="Move up" data-testid="hint-target-bat-flyer-primary" className="btfly-btn" onClick={() => dispatch({ type: "lane", dir: -1 } as BatFlyerAction)}>↑ Up</button>
        <button className="btfly-btn" onClick={() => dispatch({ type: "lane", dir: 1 } as BatFlyerAction)}>↓ Down</button>
      </div>
      <div className="btfly-hint">Use arrow keys / WASD to switch lanes — avoid the {OBSTACLE_ICON}</div>
    </div>
  );
}
