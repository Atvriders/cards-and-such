import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SafeDriverState, SafeDriverSettings } from "./state.js";
import { reducer, isTerminal } from "./state.js";
import "./SafeDriver.css";

const ROWS = 20;
const PLAYER_ROW = 17;

export function SafeDriver({ state, dispatch, onGameOver }: GameProps<SafeDriverState, SafeDriverSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
      return;
    }
    const ms = state.settings.speed === "slow" ? 500 : state.settings.speed === "fast" ? 200 : 333;
    intervalRef.current = setInterval(() => {
      dispatch({ type: "tick" });
    }, ms);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [terminal, state.settings.speed, dispatch, onGameOver]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") dispatch({ type: "left" });
      if (e.key === "ArrowRight") dispatch({ type: "right" });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  const cells: JSX.Element[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let lane = 0; lane < 3; lane++) {
      const isPlayer = row === PLAYER_ROW && lane === state.playerLane;
      const isObs = state.obstacles.some(o => o.lane === lane && o.y === row);
      let cls = "safe-driver-cell";
      if (isPlayer) cls += state.crashed ? " player crash" : " player";
      else if (isObs) cls += " obstacle";
      cells.push(<div key={`${row}-${lane}`} className={cls}>{isPlayer ? "🚗" : isObs ? "🚧" : ""}</div>);
    }
  }

  return (
    <div className="safe-driver">
      <div className="safe-driver-hud">
        <span>Lives: {"❤️".repeat(state.lives)}</span>
        <span>Distance: {state.distance}</span>
      </div>
      <div className="safe-driver-road">{cells}</div>
      {state.gameOver && <div className="safe-driver-status over">Game Over! Distance: {state.distance}</div>}
      {!state.gameOver && (
        <div className="safe-driver-controls">
          <button data-testid="hint-target-safe-driver-action" onClick={() => dispatch({ type: "left" })}>← Left</button>
          <button onClick={() => dispatch({ type: "right" })}>Right →</button>
        </div>
      )}
      {state.gameOver && (
        <button onClick={() => dispatch({ type: "restart" })}>Play Again</button>
      )}
    </div>
  );
}
