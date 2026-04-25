import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BikeRaceState, BikeRaceSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const TERRAIN_ICONS: Record<string, string> = {
  flat: "---",
  uphill: "/\\",
  downhill: "\\/",
  obstacle: "X!X",
};

export function BikeRaceGame({ state, dispatch, onGameOver }: GameProps<BikeRaceState, BikeRaceSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const pct = Math.min(100, Math.floor((state.distanceCovered / state.totalDistance) * 100));
  const staminaColor = state.stamina > 50 ? "#4caf50" : state.stamina > 25 ? "#ff9800" : "#f44336";

  return (
    <div className="bike-race">
      <div className="br-header">
        <span>Dist: {state.distanceCovered}/{state.totalDistance}m</span>
        <span>Score: {state.score}</span>
        <span>Speed: {state.speed}</span>
      </div>

      <div className="br-progress-bar">
        <div className="br-progress-fill" style={{ width: `${pct}%` }} />
        <span className="br-bike">🚴</span>
      </div>

      <div className="br-stamina-bar">
        <span>Stamina:</span>
        <div className="br-stamina-track">
          <div className="br-stamina-fill" style={{ width: `${state.stamina}%`, background: staminaColor }} />
        </div>
        <span>{state.stamina}%</span>
      </div>

      <div className="br-terrain">
        <span>Terrain: <strong>{state.terrain}</strong> {TERRAIN_ICONS[state.terrain]}</span>
      </div>

      <div className="br-message">{state.message}</div>

      {!state.gameOver && (
        <div className="br-controls">
          <button onClick={() => dispatch({ type: "pedal" })}>Pedal</button>
          <button onClick={() => dispatch({ type: "coast" })}>Coast</button>
          <button onClick={() => dispatch({ type: "sprint" })} disabled={state.stamina < 20}>
            Sprint {state.stamina < 20 ? "(low stamina)" : ""}
          </button>
        </div>
      )}

      {state.gameOver && (
        <div className="br-gameover">{state.won ? "You finished!" : "DNF"} — Score: {state.score}</div>
      )}

      <button className="br-restart" onClick={() => dispatch({ type: "restart" })}>New Race</button>
    </div>
  );
}
