import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TowerStackerState, TowerStackerAction, TowerStackerSettings } from "./state.js";
import { isTerminal, LANES, LANE_LENGTH, TICK_MS } from "./state.js";
import "./Game.css";

const PLAYER_ICON = "🟦";
const OBSTACLE_ICON = "🟥";

export function TowerStackerGame({ state, dispatch, onGameOver }: GameProps<TowerStackerState, TowerStackerSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as TowerStackerAction), TICK_MS);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  useEffect(() => {
    function handleKey(e: KeyboardEvent): void {
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") { e.preventDefault(); dispatch({ type: "lane", dir: -1 } as TowerStackerAction); }
      else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") { e.preventDefault(); dispatch({ type: "lane", dir: 1 } as TowerStackerAction); }
      else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { e.preventDefault(); dispatch({ type: "lane", dir: -1 } as TowerStackerAction); }
      else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { e.preventDefault(); dispatch({ type: "lane", dir: 1 } as TowerStackerAction); }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [dispatch]);
  if (state.phase === "done") {
    return (
      <div className="twstk-wrap">
        <div className="twstk-done">
          <h2>Crashed!</h2>
          <div className="twstk-stats">Survived {state.ticks} ticks</div>
          <div className="twstk-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="twstk-wrap">
      <div className="twstk-header">
        <span className="twstk-info">Survived: {state.ticks}</span>
        <span className="twstk-score">{state.score} pts</span>
      </div>
      <div className="twstk-track">
        {Array.from({ length: LANES }).map((_, lane) => (
          <button key={lane} className={`twstk-lane${state.playerLane === lane ? " active" : ""}`}
            onClick={() => dispatch({ type: "setLane", lane } as TowerStackerAction)}
            aria-label={`lane ${lane}`}>
            {state.playerLane === lane && (
              <span className="twstk-player" style={{ left: `${100 / LANE_LENGTH / 2}%` }}>{PLAYER_ICON}</span>
            )}
            {state.obstacles.filter(o => o.lane === lane).map(o => (
              <span key={o.id} className="twstk-obstacle"
                style={{ left: `${(o.x + 0.5) * 100 / LANE_LENGTH}%` }}>{OBSTACLE_ICON}</span>
            ))}
          </button>
        ))}
      </div>
      <div className="twstk-controls">
        <button data-testid="hint-target-tower-stacker-primary" className="twstk-btn" onClick={() => dispatch({ type: "lane", dir: -1 } as TowerStackerAction)}>↑ Up</button>
        <button className="twstk-btn" onClick={() => dispatch({ type: "lane", dir: 1 } as TowerStackerAction)}>↓ Down</button>
      </div>
      <div className="twstk-hint">Use arrow keys / WASD to switch lanes — avoid the {OBSTACLE_ICON}</div>
    </div>
  );
}
