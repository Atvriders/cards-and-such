import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { EndlessWhackMoleState, EndlessWhackMoleAction, EndlessWhackMoleSettings } from "./state.js";
import { isTerminal, LANES, LANE_LENGTH, TICK_MS } from "./state.js";
import "./Game.css";

const PLAYER_ICON = "🔨";
const OBSTACLE_ICON = "🐹";

export function EndlessWhackMoleGame({ state, dispatch, onGameOver }: GameProps<EndlessWhackMoleState, EndlessWhackMoleSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as EndlessWhackMoleAction), TICK_MS);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  useEffect(() => {
    function handleKey(e: KeyboardEvent): void {
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") { e.preventDefault(); dispatch({ type: "lane", dir: -1 } as EndlessWhackMoleAction); }
      else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") { e.preventDefault(); dispatch({ type: "lane", dir: 1 } as EndlessWhackMoleAction); }
      else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { e.preventDefault(); dispatch({ type: "lane", dir: -1 } as EndlessWhackMoleAction); }
      else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { e.preventDefault(); dispatch({ type: "lane", dir: 1 } as EndlessWhackMoleAction); }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [dispatch]);
  if (state.phase === "done") {
    return (
      <div className="ewmole-wrap">
        <div className="ewmole-done bounce-in">
          <h2>Crashed!</h2>
          <div className="ewmole-stats">Survived {state.ticks} ticks</div>
          <div className="ewmole-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="ewmole-wrap fade-in">
      <div className="ewmole-header">
        <span className="ewmole-info">Survived: {state.ticks}</span>
        <span className="ewmole-score pulse">{state.score} pts</span>
      </div>
      <div className="ewmole-track">
        {Array.from({ length: LANES }).map((_, lane) => (
          <button key={lane} className={`ewmole-lane${state.playerLane === lane ? " active" : ""}`}
            onClick={() => dispatch({ type: "setLane", lane } as EndlessWhackMoleAction)}
            aria-label={`lane ${lane}`}>
            {state.playerLane === lane && (
              <span className="ewmole-player" style={{ left: `${100 / LANE_LENGTH / 2}%` }}>{PLAYER_ICON}</span>
            )}
            {state.obstacles.filter(o => o.lane === lane).map(o => (
              <span key={o.id} className="ewmole-obstacle"
                style={{ left: `${(o.x + 0.5) * 100 / LANE_LENGTH}%` }}>{OBSTACLE_ICON}</span>
            ))}
          </button>
        ))}
      </div>
      <div className="ewmole-controls">
        <button title="Move up" data-testid="hint-target-endless-whack-mole-primary" className="ewmole-btn" onClick={() => dispatch({ type: "lane", dir: -1 } as EndlessWhackMoleAction)}>↑ Up</button>
        <button className="ewmole-btn" onClick={() => dispatch({ type: "lane", dir: 1 } as EndlessWhackMoleAction)}>↓ Down</button>
      </div>
      <div className="ewmole-hint">Use arrow keys / WASD to switch lanes — avoid the {OBSTACLE_ICON}</div>
    </div>
  );
}
