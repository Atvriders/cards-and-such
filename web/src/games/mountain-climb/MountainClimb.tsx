import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MountainClimbState, MountainClimbSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./MountainClimb.css";

const ROWS = 8;
const COLS = 5;

export function MountainClimb({ state, dispatch, onGameOver }: GameProps<MountainClimbState, MountainClimbSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const platformSet = new Set(
    state.platforms.flatMap(p =>
      Array.from({ length: p.width }, (_, i) => `${p.y},${p.x + i}`)
    )
  );

  return (
    <div className="mountain-climb">
      <div className="mc-stats">
        <span>Altitude: {state.altitude}/{state.maxAltitude}</span>
        <span>Lives: {"❤️".repeat(state.lives)}</span>
      </div>

      <div className="mc-board">
        {Array.from({ length: ROWS }, (_, row) =>
          Array.from({ length: COLS }, (_, col) => {
            const isPlayer = row === state.playerRow && col === state.playerCol;
            const isPlatform = platformSet.has(`${row},${col}`);
            return (
              <div
                key={`${row}-${col}`}
                className={`mc-cell${isPlatform ? " platform" : ""}${isPlayer ? " player" : ""}`}
              >
                {isPlayer ? "🧗" : isPlatform ? "🪨" : ""}
              </div>
            );
          })
        )}
      </div>

      <div className={state.won ? "mc-won" : state.gameOver ? "mc-dead" : "mc-message"}>
        {state.message}
      </div>

      {!state.gameOver && (
        <div className="mc-controls">
          <div className="mc-row">
            <button onClick={() => dispatch({ type: "jump", dir: "up" })}>▲</button>
          </div>
          <div className="mc-row">
            <button onClick={() => dispatch({ type: "jump", dir: "left" })}>◀</button>
            <button onClick={() => dispatch({ type: "jump", dir: "right" })}>▶</button>
          </div>
        </div>
      )}

      <button onClick={() => dispatch({ type: "restart" })}>New Climb</button>
    </div>
  );
}
