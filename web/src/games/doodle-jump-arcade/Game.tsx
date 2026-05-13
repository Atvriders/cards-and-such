import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DoodleJumpArcadeState, DoodleJumpArcadeAction, DoodleJumpArcadeSettings } from "./state.js";
import { isTerminal, LANES, LANE_LENGTH, TICK_MS } from "./state.js";
import "./Game.css";

const PLAYER_ICON = "🟢";
const OBSTACLE_ICON = "🟦";

export function DoodleJumpArcadeGame({ state, dispatch, onGameOver }: GameProps<DoodleJumpArcadeState, DoodleJumpArcadeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as DoodleJumpArcadeAction), TICK_MS);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  useEffect(() => {
    function handleKey(e: KeyboardEvent): void {
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") { e.preventDefault(); dispatch({ type: "lane", dir: -1 } as DoodleJumpArcadeAction); }
      else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") { e.preventDefault(); dispatch({ type: "lane", dir: 1 } as DoodleJumpArcadeAction); }
      else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { e.preventDefault(); dispatch({ type: "lane", dir: -1 } as DoodleJumpArcadeAction); }
      else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { e.preventDefault(); dispatch({ type: "lane", dir: 1 } as DoodleJumpArcadeAction); }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [dispatch]);
  if (state.phase === "done") {
    return (
      <div className="ddljmp-wrap">
        <div className="ddljmp-done bounce-in">
          <h2>Crashed!</h2>
          <div className="ddljmp-stats">Survived {state.ticks} ticks</div>
          <div className="ddljmp-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="ddljmp-wrap fade-in">
      <div className="ddljmp-header">
        <span className="ddljmp-info">Survived: {state.ticks}</span>
        <span className="ddljmp-score pulse">{state.score} pts</span>
      </div>
      <div className="ddljmp-track">
        {Array.from({ length: LANES }).map((_, lane) => (
          <button key={lane} className={`ddljmp-lane${state.playerLane === lane ? " active" : ""}`}
            onClick={() => dispatch({ type: "setLane", lane } as DoodleJumpArcadeAction)}
            aria-label={`lane ${lane}`}>
            {state.playerLane === lane && (
              <span className="ddljmp-player" style={{ left: `${100 / LANE_LENGTH / 2}%` }}>{PLAYER_ICON}</span>
            )}
            {state.obstacles.filter(o => o.lane === lane).map(o => (
              <span key={o.id} className="ddljmp-obstacle"
                style={{ left: `${(o.x + 0.5) * 100 / LANE_LENGTH}%` }}>{OBSTACLE_ICON}</span>
            ))}
          </button>
        ))}
      </div>
      <div className="ddljmp-controls">
        <button title="Move up" data-testid="hint-target-doodle-jump-arcade-primary" className="ddljmp-btn" onClick={() => dispatch({ type: "lane", dir: -1 } as DoodleJumpArcadeAction)}>↑ Up</button>
        <button className="ddljmp-btn" onClick={() => dispatch({ type: "lane", dir: 1 } as DoodleJumpArcadeAction)}>↓ Down</button>
      </div>
      <div className="ddljmp-hint">Use arrow keys / WASD to switch lanes — avoid the {OBSTACLE_ICON}</div>
    </div>
  );
}
