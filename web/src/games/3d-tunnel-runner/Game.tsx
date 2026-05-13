import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ThreedTunnelRunnerState, ThreedTunnelRunnerAction, ThreedTunnelRunnerSettings } from "./state.js";
import { isTerminal, LANES, LANE_LENGTH, TICK_MS } from "./state.js";
import "./Game.css";

const PLAYER_ICON = "🚀";
const OBSTACLE_ICON = "💠";

export function ThreedTunnelRunnerGame({ state, dispatch, onGameOver }: GameProps<ThreedTunnelRunnerState, ThreedTunnelRunnerSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as ThreedTunnelRunnerAction), TICK_MS);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  useEffect(() => {
    function handleKey(e: KeyboardEvent): void {
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") { e.preventDefault(); dispatch({ type: "lane", dir: -1 } as ThreedTunnelRunnerAction); }
      else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") { e.preventDefault(); dispatch({ type: "lane", dir: 1 } as ThreedTunnelRunnerAction); }
      else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { e.preventDefault(); dispatch({ type: "lane", dir: -1 } as ThreedTunnelRunnerAction); }
      else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { e.preventDefault(); dispatch({ type: "lane", dir: 1 } as ThreedTunnelRunnerAction); }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [dispatch]);
  if (state.phase === "done") {
    return (
      <div className="tdtnl-wrap">
        <div className="tdtnl-done bounce-in">
          <h2>Crashed!</h2>
          <div className="tdtnl-stats">Survived {state.ticks} ticks</div>
          <div className="tdtnl-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="tdtnl-wrap fade-in">
      <div className="tdtnl-header">
        <span className="tdtnl-info">Survived: {state.ticks}</span>
        <span className="tdtnl-score pulse">{state.score} pts</span>
      </div>
      <div className="tdtnl-track">
        {Array.from({ length: LANES }).map((_, lane) => (
          <button key={lane} className={`tdtnl-lane${state.playerLane === lane ? " active" : ""}`}
            onClick={() => dispatch({ type: "setLane", lane } as ThreedTunnelRunnerAction)}
            aria-label={`lane ${lane}`}>
            {state.playerLane === lane && (
              <span className="tdtnl-player" style={{ left: `${100 / LANE_LENGTH / 2}%` }}>{PLAYER_ICON}</span>
            )}
            {state.obstacles.filter(o => o.lane === lane).map(o => (
              <span key={o.id} className="tdtnl-obstacle"
                style={{ left: `${(o.x + 0.5) * 100 / LANE_LENGTH}%` }}>{OBSTACLE_ICON}</span>
            ))}
          </button>
        ))}
      </div>
      <div className="tdtnl-controls">
        <button title="Move up" data-testid="hint-target-3d-tunnel-runner-primary" className="tdtnl-btn" onClick={() => dispatch({ type: "lane", dir: -1 } as ThreedTunnelRunnerAction)}>↑ Up</button>
        <button className="tdtnl-btn" onClick={() => dispatch({ type: "lane", dir: 1 } as ThreedTunnelRunnerAction)}>↓ Down</button>
      </div>
      <div className="tdtnl-hint">Use arrow keys / WASD — dodge the {OBSTACLE_ICON} pulses</div>
    </div>
  );
}
