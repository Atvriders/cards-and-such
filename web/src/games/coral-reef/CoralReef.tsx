import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CoralReefState, CoralReefSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./CoralReef.css";

const TILE_ICONS: Record<string, string> = {
  coral: "🪸",
  fish: "🐟",
  seaweed: "🌿",
  pearl: "🫧",
  empty: "",
};

export function CoralReef({ state, dispatch, onGameOver }: GameProps<CoralReefState, CoralReefSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="coral-reef">
      <div className="cr-stats">
        <span>Collected: {state.collected}</span>
        <span>Pearls: {state.pearls}</span>
        <span>Moves: {state.moves}</span>
      </div>

      <div
        className="cr-grid"
        style={{ gridTemplateColumns: `repeat(${state.cols}, 52px)` }}
      >
        {state.grid.map((tile, idx) => (
          <div
            key={idx}
            className={`cr-cell ${tile}`}
            onClick={() => dispatch({ type: "select", idx })}
          >
            {TILE_ICONS[tile] ?? ""}
          </div>
        ))}
      </div>

      <div className={state.gameOver ? "cr-won" : "cr-message"}>{state.message}</div>

      <button data-testid="hint-target-coral-reef-action" onClick={() => dispatch({ type: "restart" })}>New Reef</button>
    </div>
  );
}
