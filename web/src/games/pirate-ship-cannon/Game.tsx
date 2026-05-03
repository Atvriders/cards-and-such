import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PirateShipCannonState, PirateShipCannonSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function PirateShipCannonGame({ state, dispatch, onGameOver }: GameProps<PirateShipCannonState, PirateShipCannonSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isOver = state.gameOver;
  const resultColor = state.lastResult === "direct" ? "#4caf50" :
                      state.lastResult === "close" ? "#ff9800" :
                      state.lastResult === "splash" ? "#2196f3" :
                      state.lastResult === "miss" ? "#f44336" : "#ccc";

  const shipX = 50 + state.enemy.position * 8;
  const shipY = 30 + Math.max(0, (100 - state.enemy.distance) * 0.4);

  return (
    <div className="pirate-cannon">
      <div className="pc-header">
        <span>Round {Math.min(state.round, state.totalRounds)}/{state.totalRounds}</span>
        <span>Score: {state.score}</span>
      </div>

      <div className="pc-sea">
        <div className="pc-ship" style={{ left: `${shipX}%`, top: `${shipY}%` }}>
          {state.enemy.sunk ? "💀" : "🚢"}
        </div>
        <div className="pc-cannon">🏴‍☠️</div>
      </div>

      <div className="pc-enemy-info">
        Enemy: dist {state.enemy.distance}, pos {state.enemy.position > 0 ? `+${state.enemy.position}` : state.enemy.position}
      </div>

      <div className="pc-aim-info">
        Power: {state.cannonPower} | Angle: {state.cannonAngle > 0 ? `+${state.cannonAngle}` : state.cannonAngle}
      </div>

      <div className="pc-message" style={{ color: resultColor }}>{state.lastShot}</div>

      {!isOver && (
        <>
          <div className="pc-controls-row">
            <button data-testid="hint-target-pirate-ship-cannon-action" onClick={() => dispatch({ type: "powerDown" })}>Power -</button>
            <span>Power: {state.cannonPower}</span>
            <button onClick={() => dispatch({ type: "powerUp" })}>Power +</button>
          </div>
          <div className="pc-controls-row">
            <button onClick={() => dispatch({ type: "aimLeft" })}>Aim Left</button>
            <span>Angle: {state.cannonAngle}</span>
            <button onClick={() => dispatch({ type: "aimRight" })}>Aim Right</button>
          </div>
          <button className="pc-fire" onClick={() => dispatch({ type: "fire" })}>
            FIRE!
          </button>
        </>
      )}

      {isOver && (
        <div className="pc-gameover">Battle over! Score: {terminal ? terminal.score : state.score}</div>
      )}

      <button className="pc-restart" onClick={() => dispatch({ type: "restart" })}>New Battle</button>
    </div>
  );
}
