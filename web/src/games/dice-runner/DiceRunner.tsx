import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceRunnerState, DiceRunnerAction, DiceRunnerSettings, TileType } from "./state.js";
import { isTerminal } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./DiceRunner.css";

const TILE_COLORS: Record<TileType, string> = {
  safe: "#cce8cc",
  obstacle: "#ee6644",
  gem: "#4488ff",
  finish: "#ffcc00",
};

const TILE_ICONS: Record<TileType, string> = {
  safe: "",
  obstacle: "X",
  gem: "*",
  finish: "F",
};

export function DiceRunner({
  state,
  dispatch,
  onGameOver,
}: GameProps<DiceRunnerState, DiceRunnerSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const trackLen = state.track.length;
  // Show a window of 12 tiles around position
  const windowSize = 12;
  const windowStart = Math.max(0, Math.min(state.position - 3, trackLen - windowSize));
  const windowEnd = Math.min(trackLen, windowStart + windowSize);
  const visibleTrack = state.track.slice(windowStart, windowEnd);

  return (
    <div className="dice-runner-game">
      <h2 className="dice-runner-title">DICE RUNNER</h2>

      <div className="dice-runner-stats">
        <div>Pos: {state.position}/{state.track.length - 1}</div>
        <div>HP: {"❤️".repeat(state.health)}</div>
        <div>Gems: {state.gems}</div>
        <div>Score: {state.score}</div>
      </div>

      <div className="dice-runner-track">
        {visibleTrack.map((tile, i) => {
          const absIdx = windowStart + i;
          const isPlayer = absIdx === state.position;
          return (
            <div
              key={absIdx}
              className={`dr-tile${isPlayer ? " dr-tile-player" : ""}`}
              style={{ background: TILE_COLORS[tile] }}
            >
              {isPlayer ? "O" : TILE_ICONS[tile]}
            </div>
          );
        })}
      </div>

      {state.dice && (
        <div className="dice-runner-dice-row">
          <Die value={state.dice[0] as 1|2|3|4|5|6} kept={false} />
          <Die value={state.dice[1] as 1|2|3|4|5|6} kept={false} />
        </div>
      )}

      <div className="dice-runner-message">{state.message}</div>

      {terminal ? (
        <div className="dice-runner-over">
          {state.won ? "You Win!" : "Game Over!"} Final Score: {state.score}
        </div>
      ) : (
        <button
          className="dice-runner-btn"
          onClick={() => dispatch({ type: "roll" } as DiceRunnerAction)}
        >
          Roll Dice
        </button>
      )}
    </div>
  );
}
